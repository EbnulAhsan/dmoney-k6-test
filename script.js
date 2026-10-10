import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const users = JSON.parse(open('./users.json'));
const tokens = JSON.parse(open('./tokens.json'));
const BASE_URL = 'https://dmoney.roadtocareer.net';

const sendMoneySuccessRate = new Rate('sendmoney_success_rate');
const paymentSuccessRate = new Rate('payment_success_rate');
const depositSuccessRate = new Rate('deposit_success_rate');

const sendMoneyTrend = new Trend('sendmoney_response_time');
const paymentTrend = new Trend('payment_response_time');
const depositTrend = new Trend('deposit_response_time');

export const options = {
    scenarios: {
        phase_0_30: {
            executor: 'constant-vus',
            vus: 2,
            duration: '30s',
            exec: 'phase1',
        },
        phase_30_60: {
            executor: 'constant-vus',
            vus: 3,
            duration: '30s',
            startTime: '30s',
            exec: 'phase2',
        },
        phase_60_90: {
            executor: 'constant-vus',
            vus: 4,
            duration: '30s',
            startTime: '60s',
            exec: 'phase3',
        },
        phase_90_120: {
            executor: 'constant-vus',
            vus: 4,
            duration: '30s',
            startTime: '90s',
            exec: 'phase4',
        },
    },
    thresholds: {
        http_req_failed: ['rate<0.15'],
        http_req_duration: ['p(95)<3000'],
        sendmoney_success_rate: ['rate>0.70'],
        payment_success_rate: ['rate>0.70'],
        deposit_success_rate: ['rate>0.70'], // বাস্তবসম্মত থ্রেশহোল্ড
    },
};

// ১. Send Money (Customer 1 ও 2 রোটেশন)
function sendMoney() {
    const isAlt = (__ITER + __VU) % 2 === 0;
    const sender = isAlt ? users.customer2 : users.customer1;
    const receiver = isAlt ? users.customer1 : users.customer2;
    const token = isAlt ? tokens.customer2 : tokens.customer1;

    const res = http.post(
        `${BASE_URL}/transaction/sendmoney`,
        JSON.stringify({
            from_account: sender.phone,
            to_account: receiver.phone,
            amount: 10,
        }),
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-AUTH-SECRET-KEY': 'ROADTOSDET',
            },
        }
    );
    sendMoneyTrend.add(res.timings.duration);

    let success = false;
    try {
        const json = res.json();
        success = (res.status === 200 || res.status === 201) && (!!json.trnxId || json.message?.toLowerCase().includes('success'));
    } catch (e) { }

    sendMoneySuccessRate.add(success);
    check(res, { 'Send Money Success': () => success });
}

// ২. Payment (Customer 1 & 2 -> Merchant 1 & 2)
function payment() {
    const isAlt = (__ITER + __VU) % 2 === 0;
    const payer = isAlt ? users.customer1 : users.customer2;
    const merchant = isAlt ? users.merchant1 : users.merchant2;
    const token = isAlt ? tokens.customer1 : tokens.customer2;

    const res = http.post(
        `${BASE_URL}/transaction/payment`,
        JSON.stringify({
            from_account: payer.phone,
            to_account: merchant.phone,
            amount: 15,
        }),
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-AUTH-SECRET-KEY': 'ROADTOSDET',
            },
        }
    );
    paymentTrend.add(res.timings.duration);

    let success = false;
    try {
        const json = res.json();
        success = (res.status === 200 || res.status === 201) && (!!json.trnxId || json.message?.toLowerCase().includes('success'));
    } catch (e) { }

    paymentSuccessRate.add(success);
    check(res, { 'Payment Success': () => success });
}

// ৩. Deposit (Agent 1 & 2 -> Customer 1 & 2)
function deposit() {
    const isAlt = (__ITER + __VU) % 2 === 0;
    const agent = isAlt ? users.agent2 : users.agent1;
    const customer = isAlt ? users.customer2 : users.customer1;
    const token = isAlt ? tokens.agent2 : tokens.agent1;

    const res = http.post(
        `${BASE_URL}/transaction/deposit`,
        JSON.stringify({
            from_account: agent.phone,
            to_account: customer.phone,
            amount: 10,
        }),
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-AUTH-SECRET-KEY': 'ROADTOSDET',
            },
        }
    );
    depositTrend.add(res.timings.duration);

    let success = false;
    try {
        const json = res.json();
        success = (res.status === 200 || res.status === 201) && (!!json.trnxId || json.message?.toLowerCase().includes('success'));
    } catch (e) { }

    depositSuccessRate.add(success);
    check(res, { 'Deposit Success': () => success });
}

// Scenarios
export function phase1() {
    sendMoney();
    sleep(0.5);
    payment();
    sleep(1);
}

export function phase2() {
    sendMoney();
    sleep(0.5);
    deposit();
    sleep(0.5);
    payment();
    sleep(1);
}

export function phase3() {
    deposit();
    sleep(0.5);
    payment();
    sleep(1);
}

export function phase4() {
    payment();
    sleep(1);
}

export function handleSummary(data) {
    return {
        'report.html': htmlReport(data),
    };
}