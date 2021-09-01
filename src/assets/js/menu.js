export default [
  /**
   * 0 通用文档识别
   */
  {
    name: '通用文档识别',
    en_name: '',
    bacgroundImgUrl: '0.png',
    childs: {
      general_text: {
        name: '通用文本',
        active: false,
        en_name: 'general_text',
        ocr_url: 'ocr/v1/general_ex',
        reco_id: 108
      },
      general_table: {
        name: '通用表格',
        active: false,
        en_name: 'general_table',
        ocr_url: 'ocr/v1/table',
        reco_id: 306
      },
      seal: {
        name: '印章识别',
        active: false,
        en_name: 'seal',
        ocr_url: 'ocr/v1/seal',
        reco_id: 308
      },
      v1_financial_report: {
        name: '财报识别',
        active: false,
        en_name: 'financial_report',
        ocr_url: 'ocr/v1/financial_report',
        reco_id: 431
      },
    }

    // {
    //   name: '财报识别',
    //   active: false
    // },
    // {
    //   name: '合同比对',
    //   active: false
    // },
    // ]
  },

  /**
   * 1 个人证件识别
   */
  {
    name: '个人证件识别',
    en_name: 'cards',
    bacgroundImgUrl: '1.png',
    childs: {
      id_card: {
        name: '身份证',
        active: false,
        en_name: 'id_card',
        ocr_url: 'ocr/v1/id_card',
        reco_id: 100
      },
      id_card_quality: {
        name: '身份证质检',
        active: false,
        en_name: 'id_card_quality',
        ocr_url: 'ocr/v2/id_card_check',
        reco_id: 436
      },
      id_card_with_quality: {
        name: '身份证识别（含质检）',
        active: false,
        en_name: 'id_card_with_quality',
        ocr_url: 'ocr/v2/id_card',
        reco_id: 136
      },
      bank_card: {
        name: '银行卡',
        active: false,
        en_name: 'bank_card',
        ocr_url: 'ocr/v1/bank_card',
        reco_id:101
      },
      temp_id_card: {
        name: '居民临时身份证',
        active: false,
        en_name: 'temp_id_card',
        ocr_url: 'ocr/v1/temp_id',
        reco_id:117
      },
      marry_card: {
        name: '结婚证',
        active: false,
        en_name: 'marry_card',
        ocr_url: 'ocr/v1/marriage_proof',
        reco_id:130
      },
      passport_card: {
        name: '护照',
        active: false,
        en_name: 'passport_card',
        ocr_url: 'ocr/v1/passport',
        reco_id: 126
      },
      birth_card: {
        name: '出生证明',
        active: false,
        en_name: 'birth_card',
        ocr_url: 'ocr/v1/birth_cert',
        reco_id:127
      },
      house: {
        name: '户口本',
        active: false,
        en_name: 'house',
        ocr_url: 'ocr/v1/hukou_proof',
        reco_id:128
      },
      official_card: {
        name: '军官证',
        active: false,
        en_name: 'official_card',
        ocr_url: 'ocr/v1/junguanzheng',
        reco_id:129
      },
      business_card: {
        name: '名片',
        active: false,
        en_name: 'business_card',
        ocr_url: 'ocr/v1/business_card',
        reco_id:307
      },
      macao_id_card: {
        name: '澳门身份证',
        active: false,
        en_name: 'macao_id_card',
        ocr_url: 'ocr/v1/macau_id_card',
        reco_id:314
      },
      hk_id_card: {
        name: '香港身份证',
        active: false,
        en_name: 'hk_id_card',
        ocr_url: 'ocr/v1/hk_id',
        reco_id:313
      },
      foreigner: {
        name: '外国人永久居留证',
        active: false,
        en_name: 'foreigner',
        ocr_url: 'ocr/v1/foreigner_greencard',
        reco_id:315
      },
      hmt_card: {
        name: '港澳台居住证',
        active: false,
        en_name: 'hmt_card',
        ocr_url: 'ocr/v1/gat_jzz',
        reco_id:311
      },
      hm_pass_card: {
        name: '内地居民往来港澳通行证',
        active: false,
        en_name: 'hm_pass_card',
        ocr_url: 'ocr/v1/ga_pass',
        reco_id:133
      },
      hmt_pass_card: {
        name: '港澳台居民往来内地通行证',
        active: false,
        en_name: 'hmt_pass_card',
        ocr_url: 'ocr/v1/gat_pass',
        reco_id:116
      },
    }
  },
  /**
   * 2 车辆相关识别
   */
  {
    name: '车辆相关识别',
    en_name: 'car',
    bacgroundImgUrl: '2.png',
    childs: {
      vehicleLicense: {
        name: '行驶证',
        active: false,
        en_name: 'vehicleLicense',
        ocr_url: 'ocr/v1/vehicle_license',
        reco_id: 102
      },
      driverLicense: {
        name: '驾驶证',
        active: false,
        en_name: 'driverLicense',
        ocr_url: 'ocr/v1/driver_license',
        reco_id: 103
      },
      vehicleRegistration: {
        name: '车辆登记证',
        active: false,
        en_name: 'vehicleRegistration',
        ocr_url: 'ocr/v1/vehicle_register',
        reco_id: 132
      },
      vehicleCertificate: {
        name: '车辆合格证',
        active: false,
        en_name: 'vehicleCertificate',
        ocr_url: 'ocr/v1/vehicle_cert',
        reco_id: 121
      },
      licensePlate: {
        name: '车牌',
        active: false,
        en_name: 'licensePlate',
        ocr_url: 'ocr/v1/lpr',
        reco_id: 113
      },
      VIN_code: {
        name: 'VIN码',
        active: false,
        en_name: 'VIN_code',
        ocr_url: 'ocr/v1/vin',
        reco_id: 318
      },
      newCarInvoice: {
        name: '新车发票',
        active: false,
        en_name: 'newCarInvoice',
        ocr_url: 'ocr/v1/vehicle_invoice',
        reco_id: 109
      },
      usedCarInvoices: {
        name: '二手车发票',
        active: false,
        en_name: 'usedCarInvoices',
        ocr_url: 'ocr/v1/vehicle_invoice2',
        reco_id: 120
      },
      policy: {
        name: '电子保单',
        active: false,
        en_name: 'policy',
        ocr_url: 'ocr/v1/e_policy',
        reco_id: 433
      },
    }
  },
  /**
   * 3 财务票据识别
   */
  {
    name: '财务票据识别',
    active: false,
    bacgroundImgUrl: '2.png',
    childs: {
      financialMixed: {
        name: '财务发票混合识别',
        active: false,
        en_name: 'financialMixed',
        ocr_url: 'ocr/v2/fapiao',
        reco_id:135
      },
      VAT: {
        name: '增值税发票',
        active: false,
        en_name: 'VAT',
        ocr_url: 'ocr/v1/invoice',
        reco_id:105
      },
    }
  },
  /**
   * 4 机构文档识别
   */
  {
    name: '机构文档识别',
    active: false,
    bacgroundImgUrl: '2.png',
    childs: {
      businessLicense: {
        name: '营业执照',
        active: false,
        en_name: 'businessLicense',
        ocr_url: 'ocr/v1/business_license',
        reco_id:104
      },
      openingPermit: {
        name: '开户许可证',
        active: false,
        en_name: 'openingPermit',
        ocr_url: 'ocr/v1/bank_khxkz',
        reco_id:125
      },
      realEstate: {
        name: '不动产登记证',
        active: false,
        en_name: 'realEstate',
        ocr_url: 'ocr/v1/realestate_register',
        reco_id:122
      },
      realEstateCertificate: {
        name: '不动产登记证明',
        active: false,
        en_name: 'realEstateCertificate',
        ocr_url: 'ocr/v1/realestate_proof',
        reco_id:131
      },
      bankCheck: {
        name: '银行支票',
        active: false,
        en_name: 'bankCheck',
        ocr_url: 'ocr/v1/check_book',
        reco_id:123
      },
      bankAcceptanceBill: {
        name: '银行承兑汇票',
        active: false,
        en_name: 'bankAcceptanceBill',
        ocr_url: 'ocr/v1/exchange_bill',
        reco_id:124
      },
      drugList: {
        name: '药品清单识别',
        active: false,
        en_name: 'drugList',
        ocr_url: 'ocr/v1/medicine_inventory',
        reco_id:434
      },
      customForm: {
        name: '海关报关单',
        active: false,
        en_name: 'customForm',
        ocr_url: 'ocr/v1/custom_form',
        reco_id:435
      },
      deed: {
        name: '房产证识别',
        active: false,
        en_name: 'deed',
        ocr_url: 'ocr/v1/realestate_cert',
        reco_id:106
      },
      bankStatement: {
        name: '银行流水',
        active: false,
        en_name: 'bankStatement',
        ocr_url: 'ocr/v1/realestate_cert',
        reco_id:439
      },
    }
  },
  /**
   * 5 人脸检测识别
   */
  {
    name: '人脸检测识别',
    active: false,
    bacgroundImgUrl: '2.png',
    childs: {
      faceComparison: {
        name: '人脸1：1比对',
        active: false,
        en_name: 'faceComparison',
        ocr_url: 'face/v1/compare',
        reco_id:201
      },
      faceDetection: {
        name: '人脸检测',
        active: false,
        en_name: 'faceDetection',
        ocr_url: 'face/v1/detect',
        reco_id: 200
      },
      bankCardDetection: {
        name: '银行卡验证',
        active: false,
        en_name: 'bankCardDetection',
        ocr_url: 'data/v1/verify_bank_card'
      },
      invoiceVerify: {
        name: '发票验证',
        active: false,
        en_name: 'invoiceVerify',
        ocr_url: 'data/v1/verify_invoice'
      },
      liveness: {
        name: '静默活体检测',
        active: false,
        en_name: 'liveness',
        ocr_url: 'data/v1/verify_invoice',
        reco_id: 316
      },
    }
  },
  /**
   * 6 数据查验接口
   */
  {
    name: '数据查验接口',
    active: false,
    childs: {
      verifyId: {
        name: '身份验证（公安简项）',
        active: false,
        en_name: 'verifyId',
        ocr_url: 'api/reco/data/v1/verify_id'
      },
      bankCardDetection: {
        name: '银行卡认证',
        active: false,
        en_name: 'bankCardDetection',
        ocr_url: 'api/reco/data/v1/verify_bank_card'
      },
      invoiceVerify: {
        name: '发票验证',
        active: false,
        en_name: 'invoiceVerify',
        ocr_url: 'api/reco/data/v1/verify_invoice'
      },
    }
  },
]