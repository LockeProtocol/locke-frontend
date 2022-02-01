<script lang="ts" setup>
import { DateTime } from 'luxon'
import _ from 'lodash'
const streamData = [
    {
        depositToken: 'DTB',
        rewardToken: 'DTA',
        rewardTokenAmount: 1000,
        tvl: 2000,
        price: 2.0,
        streamStart: DateTime.fromISO('2022-01-15T11:31:00'),
        streamEnd: DateTime.fromISO('2022-01-17T11:31:00'),
    },
    {
        depositToken: 'USDC',
        rewardToken: 'LOCKE',
        rewardTokenAmount: 1000000,
        tvl: 186282.39,
        price: 0.22,
        streamStart: DateTime.fromISO('2022-01-17T10:00:00'),
        streamEnd: DateTime.fromISO('2022-01-18T10:00:00'),

    },
    {
        depositToken: 'ETH',
        rewardToken: '$DOG',
        rewardTokenAmount: 200000,
        tvl: 0,
        price: null,
        streamStart: DateTime.fromISO('2022-01-20T12:00:00'),
        streamEnd: DateTime.fromISO('2022-01-21T12:00:00'),
    },
    {
        depositToken: 'FRAX',
        rewardToken: 'TEMPLE',
        rewardTokenAmount: 100000,
        tvl: 112508,
        price: 1.13,
        streamStart: DateTime.fromISO('2022-01-14T00:00:00'),
        streamEnd: DateTime.fromISO('2022-01-15T00:00:00'),
    },
]

const streams = _.orderBy(streamData.map(s => ({
    depositToken: s.depositToken,
    rewardToken: s.rewardToken,
    rewardTokenAmount: s.rewardTokenAmount,
    tvl: s.tvl,
    price: s.price,
    streamStart: s.streamStart,
    streamEnd: s.streamEnd,
    status: DateTime.now() > s.streamEnd ? 'completed' : DateTime.now() > s.streamStart ? 'active' : 'upcoming'
})), ['streamEnd'], ['desc'])

</script>

<template>
    <div class="py-10 mx-5 lg:mx-auto lg:container lg:max-w-screen-lg">
        <div class="flex flex-row p-4 my-4 justify-end gap-4">
            <div class="dropdown">SORT</div>
            <div class="dropdown">FILTER</div>
        </div>
        <div v-for="stream in streams" :key="stream" class="flex flex-row p-4 row cursor-pointer my-4">
            <div style="flex-basis: 20%">
                <div class="statLabel">Reward / Deposit Token</div>
                <div class="statValue">{{stream.rewardToken}} / {{stream.depositToken}}</div>
                <div :class="['status', stream.status]">{{stream.status.toUpperCase()}}</div>
            </div>
            <div style="flex-basis: 20%">
                <div class="statLabel">Reward</div>
                <div class="statValue">{{stream.rewardTokenAmount}} {{stream.rewardToken}}</div>
            </div>
            <div style="flex-basis: 20%">
                <div class="statLabel">TVL</div>
                <div class="statValue">{{stream.tvl}} {{stream.depositToken}}</div>
            </div>
            <div style="flex-basis: 20%">
                <div class="statLabel">Price</div>
                <div class="statValue">{{stream.price?.toFixed(2) ?? '---'}} {{stream.depositToken}}</div>
            </div>
            <div style="flex-basis: 20%">
                <div class="statLabel">Stream Start / End</div>
                <div class="statValue small">{{stream.streamStart.toLocaleString(DateTime.DATETIME_SHORT)}} -</div>
                <div class="statValue small">{{stream.streamEnd.toLocaleString(DateTime.DATETIME_SHORT)}}</div>
            </div>
        </div>
        <!-- <ul class="flex flex-row flex-wrap gap-10 justify-center">
            <li>
                <h2>DTB / DTA</h2>
            </li>
            <li>Test</li>
            <li>Test</li>
        </ul> -->
    </div>
</template>

<style scoped>
li {
    width: 250px;
    height: 400px;
    border-radius: 8px;
    background: #ffffff10;
    padding: 10px;
    cursor: pointer;
}

.status {
    font-family: VCR;
    font-size: 10px;
    border-radius: 4px;
    display: inline-block;
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 2px;
    padding-bottom: 2px;
    margin-top: 5px;
}

.dropdown {
    text-align: center;
    width: 100px;
    font-family: VCR;
    border: 1px solid #ffffff80;
    border-radius: 4px;
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 2px;
    padding-bottom: 2px;

}

.status.active, .status.upcoming {
    border: 1px solid  rgba(46, 186, 198, 0.5);
    background: rgba(46, 186, 198, 0.08);
}

/* .status.upcoming {
    border: 1px solid  rgba(227, 150, 82, 0.5);
    background: rgba(227, 150, 82, 0.08);
} */

.status.completed {
    border: 1px solid #ffffff80;
    background:#ffffff10;
}

.row {
    border-radius: 8px;
    background: #ffffff10;
}

.statValue.small {
    font-size: 12px;
}
</style>