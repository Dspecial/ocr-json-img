<template>
  <div class="canvas-container" @mouseleave="mouseleave">
    <canvas id="c_vui" ref="ocrCanvas" @click="canvasClick($event)"></canvas>
  </div>
</template>

<script>
export default {
  name: "OcrCanvas",
  props: [
    "imgFileUrl",
    "imgUrl",
    "coordinate",
    "ocrUrl",
    "otherParams",
    "preViewImgUrl",
    "previewData",
    "showIndex",
    "drawAllPosition",
    "coordinates",
    "rotate",
    "imgIndex",
    "crop_imgs",
    "coordinateVQ"
  ],
  data() {
    return {
      canvasscale: 1,
      isUploadingFile: false, //是否正在上传图片
      canvasHistory: [],
      cLeft: 0,
      cTop: 0,
      cWidth: "",
      cHeight: "",
      // rotate: 0,
      rotateL: 0,
      containerWidth: 1170,
      containerHeight: 570,
      startDrawPoint: "",
      centerPoint: "",
      innerImg: "",
      naWidth: "", //canvas原始尺寸
      naHeight: "",
      finalImgUrl: "",
      type: "single",
      imgData: "",
    };
  },
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
      // return flag;
      return false;
    },
    canvasClick(event) {
      let c = this.$refs.ocrCanvas;
      let c_style_width = c.offsetWidth;
      let c_style_height = c.offsetHeight;
      let c_real_width = c.width;
      let c_real_height = c.height;
      let event_offset_left = event.offsetX;
      let event_offset_top = event.offsetY;

      let x_percent = c_style_width / c_real_width; //横向百分比
      let y_percent = c_style_height / c_real_height; //纵向百分比

      let start_x, start_y;
      if (this.rotate !== 0) {
        let isNine = (this.rotate / 90) % 2 === 0 ? true : false;
        if (isNine) {
          //还是原来的起点
          start_x = this.startDrawPoint.x;
          start_y = this.startDrawPoint.y;
        } else {
          //新的起点
          start_x = this.startDrawPoint.y;
          start_y = this.startDrawPoint.x;
        }
      } else {
        start_x = this.startDrawPoint.x;
        start_y = this.startDrawPoint.y;
      }

      let event_real_left =
        (x_percent > 1
          ? event_offset_left * x_percent
          : event_offset_left / x_percent) - start_x;
      let event_real_top =
        (y_percent > 1
          ? event_offset_top * y_percent
          : event_offset_top / y_percent) - start_y;

      if (this.type === "more") {
        let coordinates = this.coordinates;
        let index = 0;
        for (let i = 0; i < coordinates.length; i++) {
          let cur_coord = coordinates[i];
          if (
            event_real_left >= cur_coord[0] &&
            event_real_left <= cur_coord[2] &&
            event_real_top >= cur_coord[1] &&
            event_real_top <= cur_coord[5]
          ) {
            index = i;
            this.$emit("changeActiveIndex", index);
            this.drawCoord(index);
            break;
          }
        }
      }
    },
    // 获取元素距浏览器左边的距离
    getElementViewLeft(element) {
      var actualLeft = element.offsetLeft;
      var current = element.offsetParent;

      while (current !== null) {
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
      }

      if (document.compatMode == "BackCompat") {
        var elementScrollLeft = document.body.scrollLeft;
      } else {
        var elementScrollLeft = document.documentElement.scrollLeft;
      }

      return actualLeft - elementScrollLeft;
    },

    // 获取元素距浏览器顶部的距离
    getElementViewTop(element) {
      var actualTop = element.offsetTop;
      var current = element.offsetParent;

      while (current !== null) {
        actualTop += current.offsetTop;
        current = current.offsetParent;
      }

      if (document.compatMode == "BackCompat") {
        var elementScrollTop = document.body.scrollTop;
      } else {
        var elementScrollTop = document.documentElement.scrollTop;
      }

      return actualTop - elementScrollTop;
    },

    // 去除默认行为
    prEvent(ev) {
      var oEvent = ev || window.event;
      if (oEvent.preventDefault) {
        oEvent.preventDefault();
      }
      return oEvent;
    },

    // 根据坐标绘制图片
    paint(data) {
      var c = this.$refs.ocrCanvas;
      var ctx = c.getContext("2d");
      let coordinate = data;
      if (this.type === "more") {
        //画全部
        for (let i = 0; i < coordinate.length; i++) {
          let cur_coor = coordinate[i];
          let isAllZero = true;
          for (let i = 0; i < cur_coor.length; i++) {
            if (cur_coor[i] != "0") {
              isAllZero = false;
            }
          }
          if (isAllZero) {
            break;
          }

          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.lineTo(cur_coor[0], cur_coor[1]);
          ctx.lineTo(cur_coor[2], cur_coor[3]);
          ctx.lineTo(cur_coor[4], cur_coor[5]);
          ctx.lineTo(cur_coor[6], cur_coor[7]);
          ctx.strokeStyle = "#0069d1";
          ctx.closePath();
          ctx.stroke();
        }
        this.canvas_copy(c);
        return;
      } else if (this.type === "single") {
        if (coordinate) {
          //判断是不是都是0
          let isAllZero = true;
          for (let i = 0; i < coordinate.length; i++) {
            if (coordinate[i] != "0") {
              isAllZero = false;
            }
          }
          if (isAllZero) {
            return;
          }

          this.canvas_paste(c);

          ctx.beginPath();
          ctx.lineTo(coordinate[0], coordinate[1]);
          ctx.lineTo(coordinate[2], coordinate[3]);
          ctx.lineTo(coordinate[4], coordinate[5]);
          ctx.lineTo(coordinate[6], coordinate[7]);
          ctx.strokeStyle = "#0069d1";
          ctx.lineWidth = 3;
          ctx.closePath();
          ctx.stroke();

          // ctx.fillStyle = "#0069d180";
          // ctx.fill();

          let leftWrapWidth = this.containerWidth; // 左边容器的宽度
          let leftWrapHeight = this.containerHeight;
          let rotateIP = -this.rotate;
          let areaWidth = c.width;
          let areaHeight = c.height;
          let lightWidth = coordinate[2] - coordinate[0]; //标亮区域宽度
          let lightHeight = coordinate[7] - coordinate[1]; //标亮区域高度
          let isNine = (this.rotate / 90) % 2 === 0 ? true : false;
          this.canvasscale = 1;

          //同意定位到据左侧100px
          c.style.left = 0;
          c.style.top = 0;
          let L = "";
          let T = "";

          if (lightWidth > leftWrapWidth || lightHeight > leftWrapHeight) {
            //图片原尺寸大于容器宽度
            let getInitialZoomFactor = function () {
              var xZoomFactor = leftWrapWidth / lightWidth;
              var yZoomFactor = leftWrapHeight / lightHeight;

              return Math.min(xZoomFactor, yZoomFactor);
            };
            let insidePercent = getInitialZoomFactor();
            //canvas缩放
            this.canvasscale = insidePercent;
            c.style.left = 0;
            c.style.top = 0;
            c.style.width =
              parseInt(c.width * parseFloat(insidePercent)) + "px";
            c.style.height =
              parseInt(c.height * parseFloat(insidePercent)) + "px";

            //获取相对与坐标远点的坐标
            if (isNine) {
              //还是原来的起点
              let relativeLeft = Number(coordinate[0]) + this.startDrawPoint.x;
              let relativeTop = Number(coordinate[1]) + this.startDrawPoint.y;

              L =
                -relativeLeft * insidePercent +
                (leftWrapWidth - lightWidth * insidePercent) / 2 +
                "px";
              T =
                -relativeTop * insidePercent +
                (leftWrapHeight - lightHeight * insidePercent) / 2 +
                "px";
            } else {
              //新的起点
              let relativeLeft = Number(coordinate[0]) + this.startDrawPoint.y;
              let relativeTop = Number(coordinate[1]) + this.startDrawPoint.x;
              L =
                -relativeLeft * insidePercent +
                (leftWrapWidth - lightWidth * insidePercent) / 2 +
                "px";
              T =
                -relativeTop * insidePercent +
                (leftWrapHeight - lightHeight * insidePercent) / 2 +
                "px";
            }
          } else {
            //  恢复原状
            let insidePercent = 1;
            //canvas缩放
            c.style.left = 0;
            c.style.top = 0;
            c.style.width = c.width + "px";
            c.style.height = c.height + "px";
            if (isNine) {
              let relativeLeft = Number(coordinate[0]) + this.startDrawPoint.x;
              let relativeTop = Number(coordinate[1]) + this.startDrawPoint.y;
              L =
                -relativeLeft * insidePercent +
                (leftWrapWidth - lightWidth * insidePercent) / 2 +
                "px";
              T =
                -relativeTop * insidePercent +
                (leftWrapHeight - lightHeight * insidePercent) / 2 +
                "px";
            } else {
              let relativeLeft = Number(coordinate[0]) + this.startDrawPoint.y;
              let relativeTop = Number(coordinate[1]) + this.startDrawPoint.x;
              L =
                -relativeLeft * insidePercent +
                (leftWrapWidth - lightWidth * insidePercent) / 2 +
                "px";
              T =
                -relativeTop * insidePercent +
                (leftWrapHeight - lightHeight * insidePercent) / 2 +
                "px";
            }
          }

          c.style.left = L;
          c.style.top = T;
          c.style.right = "unset";
          c.style.bottom = "unset";
        }
      }
    },

    canvas_copy(canvas_ele) {
      var context = canvas_ele.getContext("2d");
      var width = context.canvas.width;
      var height = context.canvas.height;
      this.imgData = context.getImageData(0, 0, width, height);
    },

    canvas_paste(canvas_ele) {
      var context = canvas_ele.getContext("2d");
      context.putImageData(this.imgData, 0, 0);
    },

    drawCoord(coor_index) {
      let coordinate = this.coordinates[coor_index];
      var c = this.$refs.ocrCanvas;
      var ctx = c.getContext("2d");

      this.canvas_paste(c);

      ctx.beginPath();
      ctx.lineTo(coordinate[0], coordinate[1]);
      ctx.lineTo(coordinate[2], coordinate[3]);
      ctx.lineTo(coordinate[4], coordinate[5]);
      ctx.lineTo(coordinate[6], coordinate[7]);
      ctx.closePath();
      ctx.fillStyle = "#0069d180";
      ctx.fill();
    },

    positionCoord(coor_index) {
      let coordinate = this.coordinates[coor_index];
      var c = this.$refs.ocrCanvas;
      var ctx = c.getContext("2d");

      this.canvas_paste(c);

      let leftWrapWidth = this.containerWidth; // 左边容器的宽度
      let leftWrapHeight = this.containerHeight;
      let rotateIP = -this.rotate;
      let areaWidth = this.naWidth;
      let areaHeight = this.naHeight;
      let lightWidth = coordinate[2] - coordinate[0]; //标亮区域宽度
      let lightHeight = coordinate[7] - coordinate[1]; //标亮区域高度
      let isNine = (this.rotate / 90) % 2 === 0 ? true : false;
      this.canvasscale = 1;

      //同意定位到据左侧100px
      c.style.left = 0;
      c.style.top = 0;
      let L = "";
      let T = "";

      ctx.beginPath();
      ctx.lineTo(coordinate[0], coordinate[1]);
      ctx.lineTo(coordinate[2], coordinate[3]);
      ctx.lineTo(coordinate[4], coordinate[5]);
      ctx.lineTo(coordinate[6], coordinate[7]);
      ctx.closePath();
      ctx.fillStyle = "rgb(0 105 209 / 50%)";
      ctx.fill();

      if (lightWidth > leftWrapWidth || lightHeight > leftWrapHeight) {
        //图片原尺寸大于容器宽度
        let getInitialZoomFactor = function () {
          var xZoomFactor = leftWrapWidth / lightWidth;
          var yZoomFactor = leftWrapHeight / lightHeight;

          return Math.min(xZoomFactor, yZoomFactor);
        };
        let insidePercent = getInitialZoomFactor();
        //canvas缩放
        this.canvasscale = insidePercent;
        c.style.left = 0;
        c.style.top = 0;
        c.style.width = parseInt(c.width * parseFloat(insidePercent)) + "px";
        c.style.height = parseInt(c.height * parseFloat(insidePercent)) + "px";

        //获取相对与坐标远点的坐标
        if (isNine) {
          //还是原来的起点
          let relativeLeft = Number(coordinate[0]) + this.startDrawPoint.x;
          let relativeTop = Number(coordinate[1]) + this.startDrawPoint.y;

          L =
            -relativeLeft * insidePercent +
            (leftWrapWidth - lightWidth * insidePercent) / 2 +
            "px";
          T =
            -relativeTop * insidePercent +
            (leftWrapHeight - lightHeight * insidePercent) / 2 +
            "px";
        } else {
          //新的起点
          let relativeLeft = Number(coordinate[0]) + this.startDrawPoint.y;
          let relativeTop = Number(coordinate[1]) + this.startDrawPoint.x;
          L =
            -relativeLeft * insidePercent +
            (leftWrapWidth - lightWidth * insidePercent) / 2 +
            "px";
          T =
            -relativeTop * insidePercent +
            (leftWrapHeight - lightHeight * insidePercent) / 2 +
            "px";
        }
      } else {
        //  恢复原状
        let insidePercent = 1;
        //canvas缩放
        c.style.left = 0;
        c.style.top = 0;
        c.style.width = c.width + "px";
        c.style.height = c.height + "px";
        if (isNine) {
          let relativeLeft = Number(coordinate[0]) + this.startDrawPoint.x;
          let relativeTop = Number(coordinate[1]) + this.startDrawPoint.y;
          L =
            -relativeLeft * insidePercent +
            (leftWrapWidth - lightWidth * insidePercent) / 2 +
            "px";
          T =
            -relativeTop * insidePercent +
            (leftWrapHeight - lightHeight * insidePercent) / 2 +
            "px";
        } else {
          let relativeLeft = Number(coordinate[0]) + this.startDrawPoint.y;
          let relativeTop = Number(coordinate[1]) + this.startDrawPoint.x;
          L =
            -relativeLeft * insidePercent +
            (leftWrapWidth - lightWidth * insidePercent) / 2 +
            "px";
          T =
            -relativeTop * insidePercent +
            (leftWrapHeight - lightHeight * insidePercent) / 2 +
            "px";
        }
      }

      c.style.left = L;
      c.style.top = T;
      c.style.right = "unset";
      c.style.bottom = "unset";
    },

    // 鼠标滑轮滚动
    mousewheel(ev) {
      var oEvent = this.prEvent(ev),
        delta = oEvent.detail ? oEvent.detail > 0 : oEvent.wheelDelta < 0;
      var oImg = this.$refs.ocrCanvas;
      var ratioL =
          (oEvent.clientX -
            oImg.offsetLeft -
            this.getElementViewLeft(oImg.parentNode)) /
          oImg.offsetWidth,
        ratioT =
          (oEvent.clientY -
            oImg.offsetTop -
            this.getElementViewTop(oImg.parentNode)) /
          oImg.offsetHeight,
        ratioDelta = !delta ? 1 + 0.05 : 1 - 0.05,
        w = parseInt(oImg.offsetWidth * ratioDelta),
        h = parseInt(oImg.offsetHeight * ratioDelta),
        l = Math.round(
          oEvent.clientX - this.getElementViewLeft(oImg.parentNode) - w * ratioL
        ),
        t = Math.round(
          oEvent.clientY - this.getElementViewTop(oImg.parentNode) - h * ratioT
        );

      oImg.style.width = w + "px";
      oImg.style.height = h + "px";
      oImg.style.left = l + "px";
      oImg.style.top = t + "px";
    },

    //绑定事件
    addEvent(obj, sType, fn) {
      if (obj.addEventListener) {
        obj.addEventListener(sType, fn, false);
      } else {
        obj.attachEvent("on" + sType, fn);
      }
    },

    addMouseLeave(obj, sType, fn1, fn2) {
      if (obj.addEventListener) {
        obj.addEventListener(
          sType,
          function (fn1, fn2) {
            if (obj.removeEventListener) {
              obj.removeEventListener("mousemove", fn1, false);
              obj.removeEventListener("mouseup", fn2, false);
            } else {
              obj.detachEvent("on" + "mousemove", fn1);
              obj.detachEvent("on" + "mouseup", fn2);
            }
          },
          false
        );
      } else {
        obj.attachEvent("on" + sType, function (fn1, fn2) {
          if (obj.removeEventListener) {
            obj.removeEventListener("mousemove", fn1, false);
            obj.removeEventListener("mouseup", fn2, false);
          } else {
            obj.detachEvent("on" + "mousemove", fn1);
            obj.detachEvent("on" + "mouseup", fn2);
          }
        });
      }
    },

    //移除事件
    removeEvent(obj, sType, fn) {
      if (obj.removeEventListener) {
        obj.removeEventListener(sType, fn, false);
      } else {
        obj.detachEvent("on" + sType, fn);
      }
    },

    // canvasMouseDown(ev) {
    //   let oEvent = this.prEvent(ev);
    //   let oImg = this.$refs.ocrCanvas;
    //   let oParent = oImg.parentNode;
    //   let disX = oEvent.clientX - oImg.offsetLeft;
    //   let disY = oEvent.clientY - oImg.offsetTop;
    //   let vm = this;
    //   let startMove = function (ev) {
    //     if (oParent.setCapture) {
    //       oParent.setCapture();
    //     }
    //     var oEvent = ev || window.event,
    //       L = oEvent.clientX - disX,
    //       T = oEvent.clientY - disY;
    //     oImg.style.left = L + "px";
    //     oImg.style.top = T + "px";
    //     oParent.onselectstart = function () {
    //       return false;
    //     };
    //   };
    //   let endMove = function (ev) {
    //     if (oParent.releaseCapture) {
    //       oParent.releaseCapture();
    //     }
    //     oParent.onselectstart = null;
    //     vm.removeEvent(oParent, "mousemove", startMove);
    //     vm.removeEvent(oParent, "mouseup", endMove);
    //   };
    //   this.addEvent(oParent, "mousemove", startMove);
    //   this.addEvent(oParent, "mouseup", endMove);

    //   oParent.addEventListener(
    //     "mouseleave",
    //     function () {
    //       vm.removeEvent(oParent, "mousemove", startMove);
    //       vm.removeEvent(oParent, "mouseup", endMove);
    //     },
    //     false
    //   );

    //   return false;
    // },

    // canvasMouseUp(e) {
    //   var c = e.target;
    //   c.onmousemove = null;
    // },

    // mouseleave() {
    //   this.$refs.ocrCanvas.parentNode.onmousemove = null;
    // },

    refresh() {
      // this.rePositionCanvas(this.finalImgUrl);
      this.loadImageToBlob(this.finalImgUrl, this.toOcr);
    },

    rePositionCanvas(gUrl, data, coor_index, needPaint, coord) {
      let container = document.querySelector(".canvas-container");
      let containerHeight = container.offsetHeight;
      let containerWidth = container.offsetWidth;
      let _this = this;
      // let canvas = this.$refs.ocrCanvas1;
      let canvas = document.createElement("canvas");
      let cc = document.getElementById("c_vui");

      document.body.appendChild(canvas);
      canvas.style.display = "none";

      let ctx = canvas.getContext("2d");
      this.containerWidth = containerWidth;
      this.containerHeight = containerHeight;
      this.canvasHistory = [];
      this.canvasscale = 1;

      //初始化
      canvas.width = 200;
      canvas.height = 200;
      ctx.clearRect(0, 0, 200, 200);

      let img = new Image();
      img.src = gUrl;
      img.onload = function () {
        let naWidth = img.width; //图片原始宽度
        let naHeight = img.height; //图片原始高度

        naWidth = img.width; //图片原始宽度
        naHeight = img.height; //图片原始高度

        //计算对角线的长度
        let diagonal = Math.sqrt(naWidth * naWidth + naHeight * naHeight);

        //画布取2倍对角线长度
        let canvasWH = 2 * diagonal;
        canvas.width = canvasWH;
        canvas.height = canvasWH;
        _this.naWidth = canvasWH;
        _this.naHeight = canvasWH;

        //在画布中心画图片
        let centerPoint = {
          x: canvasWH / 2,
          y: canvasWH / 2,
        };

        let startDrawPoint = {
          x: canvasWH / 2 - naWidth / 2,
          y: canvasWH / 2 - naHeight / 2,
        };

        _this.startDrawPoint = startDrawPoint;
        _this.centerPoint = centerPoint;

        // ctx.drawImage(img, 0, 0);
        // return;
        //确认画布起点
        ctx.drawImage(img, startDrawPoint.x, startDrawPoint.y);

        //旋转后裁剪
        if (_this.rotate !== 0 && _this.rotate !== undefined) {
          // ctx.translate(_this.centerPoint.x, _this.centerPoint.y);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save(); //保存状态
          ctx.translate(_this.centerPoint.x, _this.centerPoint.y);
          ctx.rotate((_this.rotate * Math.PI) / 180);

          ctx.drawImage(img, -img.width / 2, -img.height / 2); //把图片绘制在旋转的中心点，
          ctx.restore(); //恢复状态
          ctx.translate(0, 0);
          //找到起点
          //判断是90的偶数倍还是奇数倍
          let isNine = (_this.rotate / 90) % 2 === 0 ? true : false;
          if (isNine) {
            //还是原来的起点
            ctx.translate(_this.startDrawPoint.x, _this.startDrawPoint.y);

            let canvasX, canvasY;
            canvasX = img.width;
            canvasY = img.height;

            var cctx = cc.getContext("2d");
            cc.width = img.width;
            cc.height = img.height;

            cctx.drawImage(
              canvas,
              _this.startDrawPoint.x,
              _this.startDrawPoint.y,
              canvasX,
              canvasY,
              0,
              0,
              canvasX,
              canvasY
            );
             _this.naWidth = img.width;
            _this.naHeight = img.height;
          } else {
            //新的起点
            ctx.translate(_this.startDrawPoint.y, _this.startDrawPoint.x);
            //旋转完后重新缩放
            //按照容器大小进行缩放
            // let persent = 0;
            // let reWidth = img.width;
            // let reHeight = img.height;

            // let getInitialZoomFactor = function () {
            //   var xZoomFactor = _this.containerWidth / reWidth;
            //   var yZoomFactor = _this.containerHeight / reHeight;

            //   return Math.min(xZoomFactor, yZoomFactor);
            // };

            // persent = getInitialZoomFactor();
            // _this.canvasscale = persent;
            // let clientWidth = parseInt(window.getComputedStyle(c).width);
            // let clientHeight = parseInt(window.getComputedStyle(c).height);

            // //计算top  left
            // _this.cLeft = (_this.containerWidth - clientWidth) / 2;
            // _this.cTop = (_this.containerHeight - clientHeight) / 2;

            // canvas.style.top = _this.cTop + "px";
            // canvas.style.left = _this.cLeft + "px";
            let canvasX, canvasY;
            canvasX = img.height;
            canvasY = img.width;

            var cctx = cc.getContext("2d");
            cc.width = img.height;
            cc.height = img.width;

            cctx.drawImage(
              canvas,
              _this.startDrawPoint.y,
              _this.startDrawPoint.x,
              canvasX,
              canvasY,
              0,
              0,
              canvasX,
              canvasY
            );

             _this.naWidth = img.width;
            _this.naHeight = img.height;
          }
        } else {
          ctx.translate(_this.startDrawPoint.x, _this.startDrawPoint.y);

          //裁剪
          let canvasX, canvasY;
          canvasX = img.width;
          canvasY = img.height;

          var cctx = cc.getContext("2d");
          cc.width = img.width;
          cc.height = img.height;

          cctx.drawImage(
            canvas,
            _this.startDrawPoint.x,
            _this.startDrawPoint.y,
            canvasX,
            canvasY,
            0,
            0,
            canvasX,
            canvasY
          );


          _this.naWidth = img.width;
          _this.naHeight = img.height;
        }

        //移除canvas 
        document.body.removeChild(canvas);

        //按照容器大小进行缩放
        let getInitialZoomFactor = function () {
          var xZoomFactor = containerWidth / _this.naWidth;
          var yZoomFactor = containerHeight / _this.naHeight;

          return Math.min(xZoomFactor, yZoomFactor);
        };

        // _this.canvasscale = getInitialZoomFactor() - 0.02;
        _this.canvasscale = getInitialZoomFactor();

        let c_width = cc.width;
        let c_height = cc.height;

        cc.style.width = c_width * _this.canvasscale + "px";
        cc.style.height = c_height * _this.canvasscale + "px";

        let clientWidth = parseInt(window.getComputedStyle(cc).width);
        let clientHeight = parseInt(window.getComputedStyle(cc).height);

        cc.style.left = (containerWidth - clientWidth) / 2 + "px";
        cc.style.top = (containerHeight - clientHeight) / 2 + "px";

        _this.startDrawPoint = {
          x: 0,
          y: 0,
        };

        if(data){
          _this.paint(data, img, coor_index);
        }else{
          if(needPaint){
            _this.canvas_copy(cc);
            _this.paint(coord);
          }else{
            _this.canvas_copy(cc);
          }
          
        }
        // _this.paint(data, img, coor_index);
      };
    },

    canvasMousemove(e) {
      let c = this.$refs.ocrCanvas;
      this.pre_scale = this.canvasscale;
      let toolHeight = 0;
      var event;
      console.log("mousemove");
      if (e.touches) {
        event = e.touches[0];
        if (e.touches.length == 1 && this.flag) {
          //一根手指事件
          var pageX =
            event.pageX || event.clientX + document.documentElement.scrollLeft;
          var pageY =
            event.pageY || event.clientY + document.documentElement.scrollTop;
          c.style.left = pageX - this.canvasX + "px";
          c.style.top = pageY - this.canvasY + "px";
          c.style.right = "unset";
          c.style.bottom = "unset";
        } else if (e.touches.length == 2 && this.flag) {
          event = e.touches[0];
          if (e.touches.length == 1 && this.flag) {
            //一根手指事件
            var pageX =
              event.pageX ||
              event.clientX + document.documentElement.scrollLeft;
            var pageY =
              event.pageY || event.clientY + document.documentElement.scrollTop;
            c.style.left = pageX - this.canvasX + "px";
            c.style.top = pageY - this.canvasY + "px";
            c.style.right = "unset";
            c.style.bottom = "unset";
          } else if (e.touches.length == 2 && this.flag) {
            let events = e.touches[0];
            let events2 = e.touches[1];
            if (events2) {
              // 第2个指头坐标在touchmove时候获取
              if (!this.pageX2) {
                this.pageX2 = events2.pageX;
              }
              if (!this.pageY2) {
                this.pageY2 = events2.pageY;
              }
              // 获取坐标之间的距离
              var getDistance = function (start, stop) {
                return Math.hypot(stop.x - start.x, stop.y - start.y);
              };
              // 双指缩放比例计算
              var zoom =
                getDistance(
                  {
                    x: events.pageX,
                    y: events.pageY,
                  },
                  {
                    x: events2.pageX,
                    y: events2.pageY,
                  }
                ) /
                getDistance(
                  {
                    x: this.pageX,
                    y: this.pageY,
                  },
                  {
                    x: this.pageX2,
                    y: this.pageY2,
                  }
                );

              //判断放大还是缩小
              let pre_dis = getDistance(
                {
                  x: this.pageX,
                  y: this.pageY,
                },
                {
                  x: this.pageX2,
                  y: this.pageY2,
                }
              );

              let after_dis = getDistance(
                {
                  x: events.pageX,
                  y: events.pageY,
                },
                {
                  x: events2.pageX,
                  y: events2.pageY,
                }
              );

              // 应用在元素上的缩放比例
              var newScale = this.originScale * zoom;

              // 缩放中心
              let center = {
                x: (events.pageX + events2.pageX) / 2,
                y: (events.pageY + events2.pageY) / 2,
              };

              let delta = after_dis > pre_dis ? 1 + 0.05 : 1 - 0.05;

              var ratioL =
                  (center.x -
                    c.offsetLeft -
                    this.getElementViewLeft(c.parentNode)) /
                  c.offsetWidth,
                ratioT =
                  (center.y -
                    c.offsetTop -
                    this.getElementViewTop(c.parentNode)) /
                  c.offsetHeight,
                ratioDelta = delta,
                w = parseInt(c.offsetWidth * ratioDelta),
                h = parseInt(c.offsetHeight * ratioDelta),
                l = Math.round(
                  center.x - this.getElementViewLeft(c.parentNode) - w * ratioL
                ),
                t = Math.round(
                  center.y - this.getElementViewTop(c.parentNode) - h * ratioT
                );

              c.style.width = w + "px";
              c.style.height = h + "px";
              c.style.left = l + "px";
              c.style.top = t + "px";

              this.pageX = events.pageX;
              this.pageY = events.pageY;
              this.pageX2 = events2.pageX;
              this.pageY2 = events2.pageY;
              // this.center = center;

              // c.style.left = c.offsetLeft - center.x + (-center.x * newScale) + "px";
              // c.style.top = c.offsetTop - center.y + (-center.y * newScale) + "px";

              // // 最大缩放比例限制
              // if (newScale > 3) {
              //   newScale = 3;
              // }
              // // 记住使用的缩放值
              // this.canvasscale = newScale;
              // 图像应用缩放效果
              // eleImg.style.transform = "scale(" + newScale + ")";
            }
          }
        }
      } else {
        event = e;
        this.pageX = e.pageX;
        if (this.flag) {
          var pageX =
            event.pageX || event.clientX + document.documentElement.scrollLeft;
          var pageY =
            event.pageY || event.clientY + document.documentElement.scrollTop;
          c.style.left = pageX - this.canvasX + "px";
          c.style.top = pageY - this.canvasY + "px";
          c.style.right = "unset";
          c.style.bottom = "unset";
        }
      }
    },

    getDistance(start, stop) {
      return Math.hypot(stop.x - start.x, stop.y - start.y);
    },
    // 画布滚动事件
    canvasWheel(e) {
      e.preventDefault();
      // let delta =
      //   (e.wheelDelta && (e.wheelDelta > 0 ? 1 : -1)) || //chrome & ie
      //   (e.detail && (e.detail > 0 ? -1 : 1));

      // let pageX = e.pageX;
      // let pageY = e.pageY;

      // let e_clientX = e.clientX;
      // let e_clientY = e.clientY;
      let c = this.$refs.ocrCanvas;
      // let pre_scale = this.pre_scale;
      // let scale;

      let delta = e.detail ? e.detail > 0 : e.wheelDelta < 0;
      var ratioL = (e.clientX - c.offsetLeft - 50) / c.offsetWidth,
        ratioT = (e.clientY - c.offsetTop) / c.offsetHeight,
        ratioDelta = !delta ? 1 + 0.1 : 1 - 0.1,
        w = parseInt(c.offsetWidth * ratioDelta),
        h = parseInt(c.offsetHeight * ratioDelta),
        l = Math.round(e.clientX - w - 50 * ratioL),
        t = Math.round(e.clientY - h * ratioT);
      c.style.width = w + "px";
      c.style.height = h + "px";
      c.style.left = l + "px";
      c.style.top = t + "px";
      // if (delta > 0) {
      //   if (this.canvasscale - 0 <= 0.05) {
      //     return;
      //   }
      //   //缩小
      //   scale = this.canvasscale - 0 - 0.05;
      // } else {
      //   //放大
      //   scale = this.canvasscale - 0 + 0.05;
      // }

      // this.canvasscale = scale;
    },
    canvasMouseDown(e) {
      // e.preventDefault();
      let event;
      if (e.touches) {
        event = e.touches[0];

        this.pageX = event.pageX;
        this.pageY = event.pageY;

        if (e.touches.length >= 2) {
          //判断是否有两个点在屏幕上
          // this.start = e.touches; //得到第一组两个点
          this.pageX2 = e.touches[1].pageX;
          this.pageY2 = e.touches[1].pageY;
        }

        this.originScale = this.canvasscale || 1;
      } else {
        event = e;
      }
      var c = this.$refs.ocrCanvas;
      var pageX =
        event.pageX || event.clientX + document.documentElement.scrollLeft;
      var pageY =
        event.pageY || event.clientY + document.documentElement.scrollTop;
      this.canvasX = pageX - c.offsetLeft;
      this.canvasY = pageY - c.offsetTop;
      this.flag = true;
      this.pre_scale = this.canvasscale;
    },
    canvasMousemove(e) {
      let c = this.$refs.ocrCanvas;
      this.pre_scale = this.canvasscale;
      let toolHeight = 0;
      var event;
      console.log("mousemove");
      if (e.touches) {
        event = e.touches[0];
        if (e.touches.length == 1 && this.flag) {
          //一根手指事件
          var pageX =
            event.pageX || event.clientX + document.documentElement.scrollLeft;
          var pageY =
            event.pageY || event.clientY + document.documentElement.scrollTop;
          c.style.left = pageX - this.canvasX + "px";
          c.style.top = pageY - this.canvasY + "px";
          c.style.right = "unset";
          c.style.bottom = "unset";
        } else if (e.touches.length == 2 && this.flag) {
          event = e.touches[0];
          if (e.touches.length == 1 && this.flag) {
            //一根手指事件
            var pageX =
              event.pageX ||
              event.clientX + document.documentElement.scrollLeft;
            var pageY =
              event.pageY || event.clientY + document.documentElement.scrollTop;
            c.style.left = pageX - this.canvasX + "px";
            c.style.top = pageY - this.canvasY + "px";
            c.style.right = "unset";
            c.style.bottom = "unset";
          } else if (e.touches.length == 2 && this.flag) {
            let events = e.touches[0];
            let events2 = e.touches[1];
            if (events2) {
              // 第2个指头坐标在touchmove时候获取
              if (!this.pageX2) {
                this.pageX2 = events2.pageX;
              }
              if (!this.pageY2) {
                this.pageY2 = events2.pageY;
              }
              // 获取坐标之间的距离
              var getDistance = function (start, stop) {
                return Math.hypot(stop.x - start.x, stop.y - start.y);
              };
              // 双指缩放比例计算
              var zoom =
                getDistance(
                  {
                    x: events.pageX,
                    y: events.pageY,
                  },
                  {
                    x: events2.pageX,
                    y: events2.pageY,
                  }
                ) /
                getDistance(
                  {
                    x: this.pageX,
                    y: this.pageY,
                  },
                  {
                    x: this.pageX2,
                    y: this.pageY2,
                  }
                );

              //判断放大还是缩小
              let pre_dis = getDistance(
                {
                  x: this.pageX,
                  y: this.pageY,
                },
                {
                  x: this.pageX2,
                  y: this.pageY2,
                }
              );

              let after_dis = getDistance(
                {
                  x: events.pageX,
                  y: events.pageY,
                },
                {
                  x: events2.pageX,
                  y: events2.pageY,
                }
              );

              // 应用在元素上的缩放比例
              var newScale = this.originScale * zoom;

              // 缩放中心
              let center = {
                x: (events.pageX + events2.pageX) / 2,
                y: (events.pageY + events2.pageY) / 2,
              };

              let delta = after_dis > pre_dis ? 1 + 0.05 : 1 - 0.05;

              var ratioL =
                  (center.x -
                    c.offsetLeft -
                    this.getElementViewLeft(c.parentNode)) /
                  c.offsetWidth,
                ratioT =
                  (center.y -
                    c.offsetTop -
                    this.getElementViewTop(c.parentNode)) /
                  c.offsetHeight,
                ratioDelta = delta,
                w = parseInt(c.offsetWidth * ratioDelta),
                h = parseInt(c.offsetHeight * ratioDelta),
                l = Math.round(
                  center.x - this.getElementViewLeft(c.parentNode) - w * ratioL
                ),
                t = Math.round(
                  center.y - this.getElementViewTop(c.parentNode) - h * ratioT
                );

              c.style.width = w + "px";
              c.style.height = h + "px";
              c.style.left = l + "px";
              c.style.top = t + "px";

              this.pageX = events.pageX;
              this.pageY = events.pageY;
              this.pageX2 = events2.pageX;
              this.pageY2 = events2.pageY;
              // this.center = center;

              // c.style.left = c.offsetLeft - center.x + (-center.x * newScale) + "px";
              // c.style.top = c.offsetTop - center.y + (-center.y * newScale) + "px";

              // // 最大缩放比例限制
              // if (newScale > 3) {
              //   newScale = 3;
              // }
              // // 记住使用的缩放值
              // this.canvasscale = newScale;
              // 图像应用缩放效果
              // eleImg.style.transform = "scale(" + newScale + ")";
            }
          }
        }
      } else {
        event = e;
        this.pageX = e.pageX;
        if (this.flag) {
          var pageX =
            event.pageX || event.clientX + document.documentElement.scrollLeft;
          var pageY =
            event.pageY || event.clientY + document.documentElement.scrollTop;
          c.style.left = pageX - this.canvasX + "px";
          c.style.top = pageY - this.canvasY + "px";
          c.style.right = "unset";
          c.style.bottom = "unset";
        }
      }
    },
    canvasMouseUp(e) {
      var c = this.$refs.ocrCanvas;
      this.flag = false;
    },
    mouseleave() {
      this.flag = false;
      this.$refs.ocrCanvas.onmousemove = null;
    },
  },
  watch: {
    
    imgFileUrl(url) {
      this.finalImgUrl = url;
      if (this.coordinates) {
        this.type = "more";
        this.rePositionCanvas(url[this.imgIndex], this.coordinates);
      } else {
        this.rePositionCanvas(url[this.imgIndex]);
      }
    },

    coordinate: function (data) {
      if (data.coor_index !== undefined) {
        this.positionCoord(data.coor_index);
      } else {
        this.paint(data.coordinate);
      }
    },
    showIndex(index) {
      if (this.coordinates) {
        this.type = "more";
        this.rePositionCanvas(this.finalImgUrl[this.imgIndex], this.coordinates);
      } else {
        this.rePositionCanvas(this.finalImgUrl[this.imgIndex]);
      }
      // this.rePositionCanvas(this.finalImgUrl[index]);
    },
    
    coordinateVQ(coordinateVQ){
      this.rePositionCanvas(this.crop_imgs[coordinateVQ.index], null, null, true, coordinateVQ.coordinate);
    }
  },
  mounted() {
    let canvas = this.$refs.ocrCanvas;

    canvas.addEventListener(
      "touchstart",
      (event) => {
        this.canvasMouseDown(event);
      },
      false
    );
    canvas.addEventListener(
      "touchmove",
      (event) => {
        event.preventDefault();
        this.canvasMousemove(event);
      },
      { passive: false }
    );
    canvas.addEventListener(
      "touchend",
      (event) => {
        if (event.touches) {
          this.canvasMouseUp(event.touches[0]);
        }
      },
      false
    );

    function getElementViewLeft(element) {
      var actualLeft = element.offsetLeft;
      var current = element.offsetParent;

      while (current !== null) {
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
      }

      if (document.compatMode == "BackCompat") {
        var elementScrollLeft = document.body.scrollLeft;
      } else {
        var elementScrollLeft = document.documentElement.scrollLeft;
      }

      return actualLeft - elementScrollLeft;
    }

    function getElementViewTop(element) {
      var actualTop = element.offsetTop;
      var current = element.offsetParent;

      while (current !== null) {
        actualTop += current.offsetTop;
        current = current.offsetParent;
      }

      if (document.compatMode == "BackCompat") {
        var elementScrollTop = document.body.scrollTop;
      } else {
        var elementScrollTop = document.documentElement.scrollTop;
      }

      return actualTop - elementScrollTop;
    }
    /*绑定事件*/
    function addEvent(obj, sType, fn) {
      if (obj.addEventListener) {
        obj.addEventListener(sType, fn, false);
      } else {
        obj.attachEvent("on" + sType, fn);
      }
    }
    function removeEvent(obj, sType, fn) {
      if (obj.removeEventListener) {
        obj.removeEventListener(sType, fn, false);
      } else {
        obj.detachEvent("on" + sType, fn);
      }
    }
    function prEvent(ev) {
      var oEvent = ev || window.event;
      if (oEvent.preventDefault) {
        oEvent.preventDefault();
      }
      return oEvent;
    }
    /*添加滑轮事件*/
    function addWheelEvent(obj, callback) {
      if (window.navigator.userAgent.toLowerCase().indexOf("firefox") != -1) {
        addEvent(obj, "DOMMouseScroll", wheel);
      } else {
        addEvent(obj, "mousewheel", wheel);
      }
      function wheel(ev) {
        var oEvent = prEvent(ev),
          delta = oEvent.detail ? oEvent.detail > 0 : oEvent.wheelDelta < 0;
        callback && callback.call(oEvent, delta);
        return false;
      }
    }
    /*页面载入后*/
    var oImg = document.getElementById("c_vui");
    /*拖拽功能*/
    (function () {
      addEvent(oImg, "mousedown", function (ev) {
        var oEvent = prEvent(ev),
          oParent = oImg.parentNode,
          disX = oEvent.clientX - oImg.offsetLeft,
          disY = oEvent.clientY - oImg.offsetTop,
          startMove = function (ev) {
            if (oParent.setCapture) {
              oParent.setCapture();
            }
            var oEvent = ev || window.event,
              L = oEvent.clientX - disX,
              T = oEvent.clientY - disY;
            oImg.style.left = L + "px";
            oImg.style.top = T + "px";
            oParent.onselectstart = function () {
              return false;
            };
          },
          endMove = function (ev) {
            if (oParent.releaseCapture) {
              oParent.releaseCapture();
            }
            oParent.onselectstart = null;
            removeEvent(oParent, "mousemove", startMove);
            removeEvent(oParent, "mouseup", endMove);
          };
        addEvent(oParent, "mousemove", startMove);
        addEvent(oParent, "mouseup", endMove);
        return false;
      });
    })();
    /*以鼠标位置为中心的滑轮放大功能*/
    (function () {
      addWheelEvent(oImg, function (delta) {
        var ratioL =
            (this.clientX -
              oImg.offsetLeft -
              getElementViewLeft(oImg.parentNode)) /
            oImg.offsetWidth,
          ratioT =
            (this.clientY -
              oImg.offsetTop -
              getElementViewTop(oImg.parentNode)) /
            oImg.offsetHeight,
          ratioDelta = !delta ? 1 + 0.05 : 1 - 0.05,
          w = parseInt(oImg.offsetWidth * ratioDelta),
          h = parseInt(oImg.offsetHeight * ratioDelta),
          l = Math.round(
            this.clientX - getElementViewLeft(oImg.parentNode) - w * ratioL
          ),
          t = Math.round(
            this.clientY - getElementViewTop(oImg.parentNode) - h * ratioT
          );

        oImg.style.width = w + "px";
        oImg.style.height = h + "px";
        oImg.style.left = l + "px";
        oImg.style.top = t + "px";
      });
    })();
  },
};
</script>

<style>
</style>