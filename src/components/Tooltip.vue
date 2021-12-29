<script setup>
</script>
<template>
    <div id="tooltip" class="tooltip">
        <div style="margin-left: 30px; margin-top: -10px;"></div>
        <svg width="0" height="0">
        <filter id="sofGlow" height="300%" width="300%" x="-75%" y="-75%">
          <feMorphology
            operator="dilate"
            radius="10"
            in="SourceAlpha"
            result="thicken"
          />
          <feGaussianBlur in="thicken" stdDeviation="10" result="blurred" />
          <feFlood flood-color="rgba(0,0,0,0.6)" result="glowColor" />
          <feComposite
            in="glowColor"
            in2="blurred"
            operator="in"
            result="softGlow_colored"
          />
          <feMerge>
            <feMergeNode in="softGlow_colored" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </svg>
    </div>
</template>

<style scoped>
.tooltip {
  font-family: VCR;
  position: absolute;
  text-align: center;
  padding: 2px;
  pointer-events: none;
  opacity: 0;
  filter: url(#sofGlow);
  font-size: 14px;
  text-align: left;
}

.tooltip text {
  fill: #fff;
  opacity: 0.6;
}
</style>