<template>
  <div>
    <json-viewer
      :value="resp_data"
      :expand-depth="5"
      copyable
      :sort="true"
    ></json-viewer>
  </div>
</template>

<script>
export default {
  props: ['resp_data']
};
</script>

<style scoped>
</style>
