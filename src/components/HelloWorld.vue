<template>
  <div class="hello">
    <button @click="connectWallet('metamask')">Connect Me</button>
    <button @click="makeCall">Make a call</button>
    <h1>{{ account }}</h1>
    <h1>{{ balance }}</h1>
    <h1>{{ msg }}</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref } from 'vue';
import useWeb3 from '@/services/web3/useWeb3';
import erc20 from '@/lib/abi/erc20-abi.json';

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: String,
  },
  setup() {

    const { connectWallet, account, chainId, call, isWalletReady } = useWeb3()
    const balance = ref('')

    const makeCall = async () => {
      balance.value = await call(erc20, ['0xf73a878dAAd7b9041f7e7C3bB429664259003dd4', 'balanceOf', [account.value]])
    }

    if (isWalletReady.value) {
      makeCall()
    }

    watch(isWalletReady, (ready) => {
      if (ready) makeCall()
    })

    watch(account, (newAccount) => {
      console.log('changed account', newAccount)
      console.log('chainId', chainId.value)
    })
    return {
      connectWallet,
      account,
      chainId,
      call,
      isWalletReady,
      makeCall,
      balance
    }
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
