<template>
  <div class="u-container">
    <div class="u-canvas">
      <ocrCanvas
        :imgFileUrl="imgFileUrl"
        :coordinate="coordinate"
        :showIndex="showIndex"
        :drawAllPosition="drawAllPosition"
        :coordinates="coordinates"
        :rotate="canvas_rotate"
        :imgIndex="imgIndex"
        :coordinateVQ="coordinateVQ"
        :crop_imgs="crop_imgs"
      ></ocrCanvas>
    </div>
    <div
      class="u-upload"
      v-loading="uploadLoading"
      element-loading-text="拼命上传识别中"
    >
      <div class="upload-box" :class="uploadSuccess ? 'hide' : ''">
        <div class="tips">鼠标滚轮可控制图片缩放</div>
        <div class="u-wrap">
          <div class="u-left">
            <input
              class="u-input"
              placeholder="请输入图片URL"
              v-model="searchImgUrl"
            />
            <span class="u-btn" @click="subUrl">识别</span>
          </div>
          <div class="u-between">或</div>
          <div class="up-w">
            <div class="up-btn">本地上传</div>
            <input
              type="file"
              accept="image/*"
              class="up-input"
              @change="inputChange($event)"
            />
          </div>
          <div class="up-hide">
            <i class="el-icon-d-arrow-right" @click="hide_upload_box()"></i>
            <!-- <i class="el-icon-d-arrow-left" v-if="uploadSuccess" @click="show_upload_box()"></i> -->
          </div>
        </div>
        <div class="tips">
          提示：可支持PNG、JPG、JPEG、BMP等，请保证需要识别的部分为图片主体部分
        </div>
      </div>
      <div class="img-list swiper-container">
        <!-- <div class="img-container">
          <img :src="imgFileUrl" alt="">
        </div> -->
        <swiper ref="mySwiper" :options="swiperOptions">
          <swiper-slide
            v-for="(v, k) in imgFileUrl"
            :key="k"
            :class="k === activeIndex ? 'active-swiper' : ''"
          >
            <div class="img-container" @click="changeActiveIndex(k)">
              <img :src="v" alt="" />
            </div>
          </swiper-slide>
        </swiper>
      </div>
      <div class="reupload">
        <div class="up-btn" @click="show_upload_box()">上传图片</div>
      </div>
    </div>

    <el-dialog title="" :visible.sync="dialogVisible" width="250px">
      <el-input
        v-model="v_code"
        placeholder="验证码"
        style="width: 100px"
      ></el-input>
      <div
        class="v_img"
        style="
          width: 100px;
          height: 40px;
          display: inline-block;
          vertical-align: top;
        "
        @click="getVerCode"
      >
        <img
          :src="code.image"
          alt="验证码"
          style="height: 40px; max-width: 110px"
        />
      </div>
      <div style="font-size: 12px; color: #1a6ad1; margin-top: 8px;">您已超过使用次数，请输入验证码后继续使用。</div>

      <span slot="footer" class="dialog-footer">
        <span class="code_veri" @click="code_sub()">确认</span>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import ocrCanvas from "../components/ocr-canvas.vue";

export default {
  props: [
    "ocrUrl",
    "otherParams",
    "coordinate",
    "preview_img",
    "drawAllPosition",
    "coordinates",
    "imgIndex",
    "canvas_rotate",
    "coordinateVQ",
    "crop_imgs",
    "ocr_id",
  ],
  components: {
    ocrCanvas,
  },
  data() {
    return {
      imgFileUrl: [],
      uploadLoading: false, // 上传中
      uploadSuccess: true, // 上传成功
      swiperOptions: {
        spaceBetween: 30,
        slidesPerView: "auto",
      },
      searchImgUrl: "",
      activeIndex: 0,
      showIndex: 0,
      dialogVisible: false,
      need_code: false, //需要输入验证码
      v_code: "",
      code: {
        key: "",
        image: "",
      },
      post_data: "",
      uploadDetail:{
        fileUrl : '', 
        isMemory : '', 
        imgIndex : ''
      }
    };
  },
  watch: {
    coordinate(data) {
      this.activeIndex = data.index;
    },
    preview_img(urlList) {
      this.imgFileUrl = urlList;

      this.$nextTick(() => {
        this.$refs.mySwiper.$swiper.slideTo(urlList.length - 1, 1000, false);
      });
    },
    imgIndex(index) {
      this.activeIndex = index;
      this.showIndex = index;
      // this.$refs.mySwiper.$swiper.slideTo(index, 1000, false);
    },
  },
  computed: {},
  methods: {
    isMobile() {
      var userAgenInfo = navigator.userAgent;
      var Agents = new Array("Android", "iPhone", "SymbianOS", "iPad", "iPod");
      var flag = false;
      for (var v = 0; v < Agents.length; v++) {
        if (userAgenInfo.indexOf(Agents[v]) > 0) {
          flag = true;
          break;
        }
      }
      return flag;
    },

    changeActiveIndex(k) {
      // // swiper选中图片
      // this.activeIndex = k;

      // // 显示哪个图片
      // this.showIndex = k;

      // this.$emit("changeIndex", k);

      this.loadImageToBlob(this.imgFileUrl[k], this.toOcr, true, k);
    },

    subUrl() {
      this.imgFileUrl = [this.searchImgUrl];
      this.loadImageToBlob(this.imgFileUrl, this.toOcr);
    },

    // 显示上传box
    show_upload_box() {
      this.uploadSuccess = false;
      this.searchImgUrl = "";
    },

    // 隐藏上传box
    hide_upload_box() {
      this.uploadSuccess = true;
    },

    // 将图片转成二进制
    loadImageToBlob(url, callback, isMemory, imgIndex) {
      if (!url) return false;

      var xhr = new XMLHttpRequest();

      xhr.open("get", url, true);

      xhr.responseType = "blob";

      xhr.onload = function () {
        // 注意这里的this.response 是一个blob对象 就是文件对象

        callback(
          this.status == 200 ? this.response : false,
          url,
          isMemory,
          imgIndex
        );
      };

      xhr.send();

      return true;
    },

    // 将返回的流数据转换为url
    getObjectURL(file) {
      let url = null;
      if (window.createObjectURL != undefined) {
        // basic
        url = window.createObjectURL(file);
      } else if (window.webkitURL != undefined) {
        // webkit or chrome
        try {
          url = window.webkitURL.createObjectURL(file);
        } catch (error) {}
      } else if (window.URL != undefined) {
        // mozilla(firefox)
        try {
          url = window.URL.createObjectURL(file);
        } catch (error) {}
      }
      return url;
    },

    code_sub(){
      if(this.v_code == ""){
        this.$message.error("请输入验证码！");
        return;
      }
      this.postOcr(this.postFormData);
      this.dialogVisible = false;
    },

    // 上传文件
    toOcr(file, fileUrl, isMemory, imgIndex) {
      let t = file.type;
      let postFormData = new FormData();
      let otherParams = this.otherParams;
      postFormData.append("file", file);

      if (otherParams) {
        for (let key in otherParams) {
          postFormData.append(key, otherParams[key]);
        }
      }

      this.uploadDetail.fileUrl  = fileUrl;
      this.uploadDetail.isMemory = isMemory;
      this.uploadDetail.imgIndex = imgIndex;
      this.postFormData = postFormData;
      this.postOcr(postFormData);
    },

    postOcr(postFormData) {
      let fileUrl = this.uploadDetail.fileUrl; 
      let isMemory = this.uploadDetail.isMemory;
      let imgIndex = this.uploadDetail.imgIndex;
      
      this.uploadLoading = true;
      this.$axios
        .post("http://52.130.144.153:8089/api/tr-run/", postFormData, this.need_code ? {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-Requested-With':'XMLHttpRequest',
            'Access-Control-Allow-Origin':'*',
          },
        } : {})
        .then((resp) => {
          this.uploadLoading = false;
          this.need_code = false;
          if ( resp.data && resp.data.code == 200) {
            this.uploadSuccess = true;
            let msg = "";
            if (resp.data.msg) {
              msg = resp.data.msg;
            }else {
              msg = "识别成功";
            }
            this.$message.success(msg);

            // 旋转角度
            // this.canvas_rotate = Number(
            //   resp.data.rotation !== undefined ? -resp.data.rotation : 0
            // );
            // let canvas_rotate = Number(
            //   resp.data.rotation !== undefined ? -resp.data.rotation : 0
            // );

            // 识别结果
            this.$emit("getOcrResult", {
              resp_data: resp.data,
              up_imgBase64: fileUrl,
              isMemory: isMemory,
              imgIndex: imgIndex,
            });

            // this.imgFileUrl = [fileUrl];
          } else if (resp.data && resp.data.code == 201) {
            // 需要验证码
            this.uploadLoading = false;
            this.uploadSuccess = false;

            this.v_code = ""
            this.dialogVisible = true;
            this.need_code = true;
            this.post_data = postFormData;
            this.getVerCode();
          } else {
            this.uploadSuccess = false;
            this.$message.error(resp.msg);
          }
        })
        .catch((error) => {
          console.log(error);
          this.$message.error('请求失败');
          this.uploadLoading = false;
          this.uploadSuccess = false;
        });
    },

    inputChange(e) {
      let file = e.target.files[0];
      let vm = this;
      if (file) {
        let filePath = file.name;
        let fileName = filePath.substring(filePath.lastIndexOf("\\") + 1); //文件名
        let extName = fileName
          .substring(fileName.lastIndexOf(".") + 1)
          .toLowerCase(); //后缀名
        if (this.isAssetTypeAnImage(extName)) {
          // let fileUrl = this.getObjectURL(file);
          // this.imgFileUrl = [fileUrl];
          // this.loadImageToBlob(fileUrl, this.toOcr);

          var reader = new FileReader(); //创建filereader对象
          reader.readAsDataURL(file); //转换数据
          reader.onload = function (e) {
            //加载ok时触发的事件
            var fileUrl = e.target.result;
            if (vm.isMobile()) {
              var img = new Image();
              img.src = fileUrl;
              img.onload = function () {
                var c = document.createElement("canvas");
                var ctx = c.getContext("2d");

                c.width = img.width;
                c.height = img.height;
                document.body.appendChild(c);
                c.style.display = "none";
                ctx.drawImage(img, 0, 0);

                var c2 = document.createElement("canvas");
                var ctx2 = c2.getContext("2d");

                c2.width = 500;
                var op = 500 / img.width;
                c2.height = img.height * op;
                document.body.appendChild(c2);
                c2.style.display = "none";
                ctx2.drawImage(
                  c,
                  0,
                  0,
                  img.width,
                  img.height,
                  0,
                  0,
                  c2.width,
                  c2.height
                );

                var final = c2.toDataURL();

                // 移除canvas
                document.body.removeChild(c2);
                document.body.removeChild(c);

                vm.loadImageToBlob(final, vm.toOcr);
              };
            } else {
              vm.toOcr(file, fileUrl);
            }
          };
        } else {
          Message.error("请上传正确格式的图片！");
          return;
        }
      }
    },

    isAssetTypeAnImage(ext) {
      return (
        ["png", "jpg", "jpeg", "bmp", "webp", "psd", "pdf"].indexOf(
          ext.toLowerCase()
        ) !== -1
      );
    },

    getVerCode() {
      this.$axios
        .get(this.$ocrDomainNames + "api/captcha/generateCaptcha")
        .then((resp) => {
          if (resp.status === 200 && resp.data && resp.data.success) {
            this.code.key = resp.data.data.key;
            this.code.image = resp.data.data.image;
          } else {
            this.$message.error(resp.msg);
          }
        }).catch((error) => {
          console.log(error);
          this.$message.error("获取验证码失败");
        });
    },
  },
  mounted() {
  },
};
</script>

<style scoped>
.ocr .left .u-container .u-upload .img-list {
  width: calc(100% - 151px);
}
.swiper-container {
  width: 100%;
  height: 100%;
}
.swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #fff;
  width: 90px;
  height: 82px;
  border: 2px solid transparent;

  /* Center slide text vertically */
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
}

.active-swiper {
  border-color: #0069d1;
}


</style>
