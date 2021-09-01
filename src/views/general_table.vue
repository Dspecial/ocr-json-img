<template>
  <div>
    <!-- 自身模块 -->
    <div class="banner self-banner">
      <div class="banner-content">
        <div class="inner">
          <div class="ocr">
            <div class="left">
              <ocrLeft
                :ocrUrl="ocrUrl"
                :preview_img="preview_img"
                @getOcrResult="getOcrResult"
                :coordinate="coordinate"
                :imgIndex="imgIndex"
                :canvas_rotate="canvas_rotate"
                :ocr_id="reco_id"
              ></ocrLeft>
            </div>
            <div class="right">
              <el-collapse v-model="activeNames" accordion>
                <el-collapse-item name="1">
                  <template slot="title">
                    <div class="title">
                      <img :src="require('@/assets/images/tb.png')" alt="" />
                      <span>识别结果</span>
                    </div>
                  </template>
                  <div class="result" v-if="tables.length > 0">
                    <!-- 标题 -->
                    <div class="content">
                      <div
                        class="item"
                        v-for="(v, k) in resp_data.orther"
                        :key="k"
                        @click="resultMouseClick_v(v.rect, k)"
                      >
                        <span class="name" style="width: 40px">{{
                          k + 1
                        }}</span>
                        <span class="val">{{ v.text }}</span>
                      </div>
                    </div>
                    <!-- 表格 -->
                    <div class="ocr-table-wrap">
                      <table
                        class="ocr-table"
                        v-for="(it, tid) in tables"
                        :key="tid"
                      >
                        <tr v-for="(item, index) in it" :key="index">
                          <td
                            v-for="(td, i) in item"
                            :key="i"
                            :rowspan="td.rowspan"
                            :colspan="td.colspan"
                            @click="resultMouseClick(td.rect, tid)"
                          >
                            <div class="cell">{{ td.text }}</div>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </div>
                  <ocrNoResult v-else></ocrNoResult>

                  <!-- <div class="no-result" v-else>
                    <div class="no-cell">
                      <div><img :src="require('../../assets/img/empty.png')" alt=""></div>
                      <div>数据为空</div>
                    </div>
                  </div> -->
                </el-collapse-item>
                <el-collapse-item name="2">
                  <template slot="title">
                    <div class="title">
                      <img :src="require('@/assets/images/tb2.png')" alt="" />
                      <span>Response JSON</span>
                    </div>
                  </template>
                  <ocrResult :resp_data="resp_data"></ocrResult>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ocrLeft from "@/components/ocr-left.vue";
import ocrResult from "@/components/ocr-result.vue";
import ocrNoResult from "@/components/ocr-no-result.vue";

import preview_data from "@/assets/js/general_table_new.js";

export default {
  components: {
    ocrLeft,
    ocrResult,
    ocrNoResult,
  },
  data() {
    return {
      firstKey: 0,
      secondKey: 1,
      activeNames: ["1"],
      tables: [],
      resp_data: "",
      coordinate: [],
      preview_img: [],
      imgIndex: 0, // 当前显示的哪个图片
      canvas_rotate: 0
    };
  },
  computed: {
    ocrUrl() {
      return this.$menuData[0].childs.general_table.ocr_url;
    },
    reco_id(){
      return this.$menuData[0].childs.general_table.reco_id;
    }
  },
  methods: {
    buildTables() {
      let tables = [];
      let result = this.resp_data.table;
      if (result) {
        let cells = result.ocr_contents;
        let table = [];
        // let cols = 0;
        //一行
        for (let c = 0; c < cells.length; c++) {
          let rowIndex = cells[c].row_index;
          if (table[rowIndex]) {
            table[rowIndex].push(cells[c]);
          } else {
            table[rowIndex] = [];
            table[rowIndex].push(cells[c]);
          }
        }
        //列排序
        for (let j = 0; j < table.length; j++) {
          let cols = table[j];
          if (cols) {
            if (cols.length > 1) {
              table[j] = this.bubbleSort(cols);
            } else {
              table[j] = cols;
            }
          }
        }
        tables.push(table);
      }
      this.tables = tables;
    },

    getOcrResult(result) {
      this.resp_data = result.resp_data.data;

      if(!result.isMemory){
        this.preview_img.push(result.up_imgBase64);
        this.imgIndex = this.preview_img.length - 1;
      }else{
        this.imgIndex = result.imgIndex;
      }

      this.canvas_rotate = Number(
        result.resp_data.rotation !== undefined ? -result.resp_data.rotation : 0
      );

      this.buildTables();
    },

    //冒泡从小到大
    bubbleSort(resultArr) {
      let flag = true;
      let arr = resultArr;
      for (let i = 0; i < arr.length - 1; i++) {
        flag = true;
        for (let j = 0; j < arr.length - 1 - i; j++) {
          if (arr[j].col_index > arr[j + 1].col_index) {
            let temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
            flag = false;
          }
        }
        if (flag) {
          break;
        }
      }
      return arr;
    },

    resultMouseClick_v(data) {
      // data：左、上、右、下
      let coord = [];
      coord.push(data[0]);
      coord.push(data[1]);
      coord.push(data[2]);
      coord.push(data[1]);
      coord.push(data[2]);
      coord.push(data[3]);
      coord.push(data[0]);
      coord.push(data[3]);
      // coordinate:[247,109,343,109,343,129,247,129], 左、上、右（左+宽）、上、右（左+宽）、下（上+高）、左、下（上+高）
      this.coordinate = {
        index: this.imgIndex,
        coordinate: coord,
      };
    },

    resultMouseClick(data) {
      let coord = [];
      coord.push(data[0]);
      coord.push(data[1]);
      coord.push(data[2]);
      coord.push(data[1]);
      coord.push(data[2]);
      coord.push(data[3]);
      coord.push(data[0]);
      coord.push(data[3]);
      this.coordinate = {
        index: this.imgIndex,
        coordinate: coord,
      };
    },
  },
  mounted() {
    this.resp_data = preview_data.data;
    this.buildTables();
    this.preview_img = [
      require("@/assets/images/general_table.jpg"),
    ];
  },
};
</script>

<style scoped>
</style>