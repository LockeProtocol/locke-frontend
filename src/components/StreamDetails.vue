<script lang="ts" setup>
import { computed } from 'vue'
import type { StreamData } from '@/composables/useStreamData'
import { formatDate, humanDuration } from '@/lib/utils/format'
import { DateTime, Duration } from 'luxon'
import VueCountdown from '@chenfengyuan/vue-countdown'
import InfoBox from '@/components/InfoBox.vue'
import { config } from '@/lib/utils/config'

// Props
const props = defineProps<{
  stream: StreamData
}>()

// For countdown timer
function transformSlotProps(props: Object) {
    const formattedProps = {};

      Object.entries(props).forEach(([key, value]) => {
        formattedProps[key] = value < 10 ? `0${value}` : String(value);
      });

      return formattedProps;
}

// Computed

const streamStart = computed(() => formatDate(props.stream.streamParams.startTime))
const streamEnd = computed(() => formatDate(props.stream.streamParams.endStream))
const totalReward = computed(() => props.stream.tokenAmounts.rewardTokenAmount.toLocaleString())
const totalDeposited = computed(() => props.stream.tokenAmounts.depositTokenAmount.toLocaleString())
const streamType = computed(() => props.stream.isSale ? "Sale" : "Rental")
const secondsRemaining = computed(() => {
    return Math.max(0, props.stream.streamParams.endStream
        - DateTime.now().toSeconds())
})
const secondsUntilStart = computed(() => {
    return Math.max(0, props.stream.streamParams.startTime
        - DateTime.now().toSeconds())
})
function getDepositLockDuration(stream) {
    if (stream.isSale) return '∞'
    let seconds = stream.streamParams.endDepositLock - stream.streamParams.endStream;
    if (seconds == 0) return '--'
    let duration = Duration.fromObject({seconds: seconds})
    return humanDuration(duration).toUpperCase()
}
</script>

<template>
    <div class="roundedBox">
        <div class="grid grid-cols-2" id="statsBox">
            <div>
                <div class="statLabel">Deposit Token</div>
                <div class="statValue">
                    <a :href="`${config.blockExplorerPrefix}/address/${stream.depositToken.address}`"
                        target="_blank">
                        {{stream.depositToken.symbol}} →
                    </a>
                </div>
            </div>
            <div>
                <div class="statLabel">Reward Token</div>
                <div class="statValue">
                    <a :href="`${config.blockExplorerPrefix}/address/${stream.rewardToken.address}`"
                        target="_blank">
                        {{stream.rewardToken.symbol}} →
                    </a>
                </div>
            </div>
            <div>
                <div class="statLabel">Total Reward <info-box message="The total amount of rewards that will be distributed pro-rata to all depositors"/></div>
                <div class="statValue">{{totalReward}} {{stream.rewardToken.symbol}}</div>
            </div>
            <div>
                <div class="statLabel">
                    <div v-if="secondsUntilStart > 0">Time Until Start</div>
                    <div v-else>Time Remaining</div>
                </div>
                <div class="statValue">
                    <vue-countdown 
                        v-if="secondsUntilStart > 0" 
                        :time="secondsUntilStart * 1000" 
                        :transform="transformSlotProps" 
                        v-slot="{ days, hours, minutes, seconds }">
                        {{ days }}:{{ hours }}:{{ minutes }}:{{ seconds }}
                    </vue-countdown>
                    <vue-countdown style="color: #43E0E4a0"
                        v-else-if="secondsRemaining > 0" 
                        :time="secondsRemaining * 1000" 
                        :transform="transformSlotProps" 
                        v-slot="{ days, hours, minutes, seconds }">
                        {{ days }}:{{ hours }}:{{ minutes }}:{{ seconds }}
                    </vue-countdown> 
                    <div v-else>--</div>
                </div>
            </div>
            <div>
                <div class="statLabel">Stream Start</div>
                <div class="statValue">{{streamStart}}</div>
            </div>
            <div>
                <div class="statLabel">Stream End</div>
                <div class="statValue">{{streamEnd}}</div>
            </div>
            <div v-if="!stream.isSale">
                <div class="statLabel">Deposit Lock Duration</div>
                <div class="statValue">{{getDepositLockDuration(stream)}}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#statsBox > div {
  padding: 20px;
}
</style>