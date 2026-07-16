<<<<<<< HEAD
/* ================================================================
=======
﻿/* ================================================================
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
 *  时刻 v0.7.0 - Shike PWA
 *  核心: NLP Parser / Live Countdown / Universal Cards / i18n / Themes
 * ================================================================ */
/* ========== i18n ========== */
var I18N={
  'zh-CN':{
    appName:'时刻',tagline:'你的贴心记事助手',save:'保存',cancel:'取消',delete:'删除',edit:'编辑',
    inputPlaceholder:'试着写下需要记住的事情',inputHint:'可识别时间、重复和纪念日，保存后自动进入日历',
    demoPrefix:'不知道写什么？',demoAction:'体验示例',demoAlready:'示例已经在这里了',
    demoAdded:'已添加 {n} 条示例记录，可以在首页、全部和日历查看',
    todayOverview:'今日概览',todayOverviewCount:'今天 {n} 个时刻',overviewNext:'最近',overviewAnniv:'纪念',
    overviewEmpty:'还没有时刻。试试输入“明天下午三点开会”。',overviewNoNext:'暂时没有即将到来的安排',overviewNoAnniv:'还没有纪念日',
    timelineTitle:'时间旅程线',timelineSub:'按时间看见你的安排',timelineToday:'今天',timelineTomorrow:'明天',timelineWeek:'本周',timelineFuture:'未来',timelineUndated:'无日期',
    timelineTodayCopy:'有 {n} 个时刻正在靠近',timelineTomorrowCopy:'有 {n} 个安排等待你',timelineWeekCopy:'还有 {n} 件事可以提前准备',timelineFutureCopy:'这些日子值得慢慢等',timelineUndatedCopy:'这些想法还没有落到具体日期',
    timelineEmptyToday:'今天暂时很安静',timelineEmptyTomorrow:'明天还没有安排',timelineEmptyWeek:'本周剩余时间暂无记录',timelineEmptyFuture:'未来还没有日期安排',timelineEmptyUndated:'无日期想法会出现在这里',
    saveCardImage:'保存卡片',cardExportDone:'卡片图片已生成',cardExportUnsupported:'当前浏览器暂不支持导出图片，可以截图保存。',
    spriteName:'时刻精灵',spriteOpen:'打开时刻精灵',spriteClose:'收起时刻精灵',
    spriteInputAction:'写一句',spriteDemoAction:'体验示例',
    spriteEmptyMessage:'把一句话交给我，我帮你整理成一个时刻。',
    spriteDemoMessage:'不知道写什么？可以点体验示例，看提醒、纪念、习惯和日历怎么连起来。',
    spriteSoonMessage:'最近有 {n} 个时刻快到了，记得看一眼。',
    spriteTodayMessage:'今天有 {n} 个时刻在等你。',
    spriteQuietMessage:'我会在这里帮你留意最近的时刻。',
    spriteTodayLine:'今日 {n} 条',spriteNextLine:'最近：{title} · {when}',
    spriteTip1:'我可以帮你把一句话变成时刻。',spriteTip2:'今天有什么安排，可以先看看首页。',spriteTip3:'一段聊天也可以批量整理。',spriteTip4:'重要记录记得导出备份。',spriteTip5:'有日期的记录可以导出到系统日历。',
<<<<<<< HEAD
    navHome:'首页',navCal:'日历',navAll:'全部',navWatch:'关注',navImport:'整理',navMy:'我的',
=======
    navHome:'首页',navCal:'日历',navAll:'全部',navImport:'整理',navMy:'我的',
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    allRecords:'全部记录',searchRecords:'搜索记录',noSearchResult:'没有找到相关记录',
    all:'全部',reminder:'提醒',anniversary:'纪念',habit:'习惯',note:'备忘',
    close:'关闭',confirm:'确定',details:'详情',setLarge:'大卡片',setNormal:'普通',setBg:'换背景',
    setPin:'置顶',unpin:'取消置顶',theme:'主题',setTheme:'主题',language:'语言',calendarMode:'日历显示',
    solar:'新历',lunar:'农历',weather:'首页天气',username:'用户名',usernamePh:'设置你的名字',
    personalize:'个性化',about:'关于',enableNotify:'开启通知',notifyPerm:'通知权限',
    replayIntro:'重播开场',batchImport:'批量整理',importHint:'每行一条，自动识别时间和类型。',
    parseImport:'识别内容',loadExample:'填入示例',uploadTxt:'上传TXT',exportData:'导出数据',
    calendarExport:'日历导出',calendarExportHint:'生成标准 .ics 文件，可导入 Google Calendar、Apple Calendar 或 Outlook。',
    exportIcs:'导出全部日历文件',exportRecordIcs:'导出日历',icsExportDone:'日历文件已导出',icsExportEmpty:'没有可导出的日期记录',
    icsExportResult:'已导出 {n} 条日历记录，跳过 {skipped} 条无日期记录',
    dataSafety:'数据安全',dataSafetyHint:'时刻的数据保存在当前浏览器。重要记录建议定期导出备份。',
    calendarImportGuideTitle:'如何导入日历',calendarImportGuide:'这是手动导入标准日历文件：Google Calendar 在设置里选择“导入和导出”；Apple Calendar 可直接打开 .ics 或在日历 App 导入；Outlook 在导入/订阅日历中选择 .ics 文件。',
    recordCountLabel:'当前记录数',exportableCountLabel:'可导出日历数',undatedCountLabel:'无日期记录数',lastBackupLabel:'上次备份',
    neverBackedUp:'尚未备份',backupSuggested:'记录较多，建议导出 JSON 备份。',backupLooksOk:'记录不多，按需要备份即可。',
    backupVsCalendarHint:'JSON 备份用于恢复时刻数据；.ics 用于导入第三方日历，两者不是一回事。',
    exportJsonBackup:'导出 JSON 备份',importJsonBackup:'导入 JSON 备份',storageEngineLabel:'数据仓库',quarantineCountLabel:'隔离记录',exportQuarantine:'导出隔离数据',indexedDbMode:'IndexedDB 主仓库',legacyFallbackMode:'本地缓存回退',
    reminderNoticeTitle:'提醒说明',reminderNoticeText:'网页版提醒依赖浏览器环境。页面关闭后，长期提醒不一定可靠；建议将时刻添加到桌面并定期打开查看，重要日程建议导出 .ics 到系统日历。',
    installPwa:'添加到桌面',pwaInstallHint:'如果浏览器没有显示安装按钮，可使用浏览器菜单中的“添加到桌面”或“安装应用”。',
    draftExisting:'已存在',draftDuplicateSkipped:'已跳过重复草稿',batchSaveAll:'全部保存',
    batchSavedOnly:'已保存 {saved} 条',batchSavedResult:'已保存 {saved} 条，跳过 {skipped} 条重复',batchSkippedOnly:'没有新增，已跳过 {skipped} 条重复',
    exampleRecordsTitle:'示例记录',exampleRecordsText:'首次体验时可一键生成 5 条示例记录，不覆盖真实数据。',
    feedbackTitle:'建议与反馈',feedbackText:'遇到问题或有建议，可以发邮件告诉我。',writeEmail:'写邮件',copyEmail:'复制',feedbackCopied:'邮箱已复制',copyFeedbackTemplate:'复制反馈模板',feedbackTemplateCopied:'反馈模板已复制',feedbackTemplateLabel:'反馈时可以带上这些信息：',feedbackTemplateText:'遇到的问题：\n使用场景：\n浏览器/设备：\n希望改进：',feedbackNoUpload:'这里不接表单后端，也不会上传你的本地数据。',copyRecord:'复制',recordCopied:'记录已复制',moreActions:'更多',
<<<<<<< HEAD
    futurePlanTitle:'未来计划',futurePlanText:'会继续探索更主动的助手能力、更丰富的提醒方式、更好的日历衔接和更稳定的数据保护。',futurePlan1:'更主动的助手能力。',futurePlan2:'更好的日历衔接。',futurePlan3:'更丰富的提醒方式。',futurePlan4:'更安全的数据保护。',futurePlan5:'多设备体验探索。',productPositionTitle:'产品定位',productPositionText:'时刻不是替代日历，而是帮你把聊天、通知和脑子里的一句话，先整理成有时间感的记录，再连接日历导出、备份和提醒说明。',capabilityChecklistTitle:'产品能力清单',capabilityChecklistText:'当前版本主要能力集中在本地记录、整理、导出和演示路径上。',capabilityOneSentence:'一句话输入',capabilityLocalSave:'本地保存',capabilityJsonBackup:'JSON 备份',capabilityIcsExport:'.ics 导出',capabilityBatchOrganize:'批量整理',capabilityDedupe:'去重保护',capabilitySprite:'小熊助手',capabilityRecordActions:'记录快捷操作',capabilityUpdateCenter:'更新中心',capabilityWatchCenter:'关注中心',capabilityFeedback:'反馈入口',featureHubTitle:'功能中心',featureHubText:'把示例、演示、更新、备份、日历和反馈入口收在这里。',featureHubDemo:'体验示例',featureHubDemoSub:'生成 5 条示例',featureHubRoute:'演示路线',featureHubRouteSub:'从输入到导出',featureHubUpdates:'版本更新',featureHubUpdatesSub:'查看本次变化',featureHubSafety:'数据安全',featureHubSafetySub:'JSON 备份',featureHubCalendar:'日历导出',featureHubCalendarSub:'导出 .ics',featureHubFeedback:'建议反馈',featureHubFeedbackSub:'邮件联系',featureHubFuture:'未来计划',featureHubFutureSub:'能力预告',releaseCenterTitle:'更新记录',releaseCenterText:'最近版本变化集中放在这里，首次打开时仍会弹出本次更新。',releaseCenterV140:'关注中心',releaseCenterV130:'本地 Agent Core',releaseCenterV120:'本地优先数据',releaseCenterV110:'模块化架构',releaseCenterV100rc:'正式稳定版',releaseCenterV098:'更新中心与反馈闭环',releaseCenterV097:'记录卡片操作增强',releaseCenterV096:'首页精简与功能中心',releaseCenterV095:'时刻精灵 2.0',releaseCenterV094:'个性化前置',releaseCenterV093:'产品体验打磨',viewCurrentRelease:'查看本次更新',personalizeDesc:'调整主题、语言和时刻精灵，让时刻更像你的助手。',chipTheme:'主题',chipLanguage:'语言',chipSprite:'小精灵',chipDisplay:'显示偏好',
    releaseTitle:'更新说明',releaseOk:'我知道了',releaseMeta:'当前版本 {version} · {time}',
    releaseNote1:'新增「关注中心」：可添加关键词关注，内置公开信息源示例，支持手动刷新和已读标记。',releaseNote2:'关注数据完全保存在本地（localStorage），不会上传到任何服务器。',releaseNote3:'小熊可帮你打开关注中心、添加关注关键词（添加前会确认）。',releaseNote4:'内容来源为内置公开白名单示例数据，不提供实时行情、买卖建议或虚构新闻。',releaseNote5:'当无可用来源时，会诚实告知而非编造内容。',
    spriteTodayAction:'看今天',spriteBatchAction:'整理一段',spriteCalendarAction:'看日历',spriteExportAction:'导出日历',spriteBackupAction:'备份',spriteUpdateAction:'更新',spriteResetAction:'重置位置',spriteFutureHint:'更主动的智能助手能力正在规划中。',
=======
    futurePlanTitle:'未来计划',futurePlanText:'会继续探索更主动的助手能力、更丰富的提醒方式、更好的日历衔接和更稳定的数据保护。',futurePlan1:'更主动的助手能力。',futurePlan2:'更好的日历衔接。',futurePlan3:'更丰富的提醒方式。',futurePlan4:'更安全的数据保护。',futurePlan5:'多设备体验探索。',productPositionTitle:'产品定位',productPositionText:'时刻不是替代日历，而是帮你把聊天、通知和脑子里的一句话，先整理成有时间感的记录，再连接日历导出、备份和提醒说明。',capabilityChecklistTitle:'产品能力清单',capabilityChecklistText:'当前版本主要能力集中在本地记录、整理、导出和演示路径上。',capabilityOneSentence:'一句话输入',capabilityLocalSave:'本地保存',capabilityJsonBackup:'JSON 备份',capabilityIcsExport:'.ics 导出',capabilityBatchOrganize:'批量整理',capabilityDedupe:'去重保护',capabilitySprite:'小熊助手',capabilityRecordActions:'记录快捷操作',capabilityUpdateCenter:'更新中心',capabilityFeedback:'反馈入口',featureHubTitle:'功能中心',featureHubText:'把示例、演示、更新、备份、日历和反馈入口收在这里。',featureHubDemo:'体验示例',featureHubDemoSub:'生成 5 条示例',featureHubRoute:'演示路线',featureHubRouteSub:'从输入到导出',featureHubUpdates:'版本更新',featureHubUpdatesSub:'查看本次变化',featureHubSafety:'数据安全',featureHubSafetySub:'JSON 备份',featureHubCalendar:'日历导出',featureHubCalendarSub:'导出 .ics',featureHubFeedback:'建议反馈',featureHubFeedbackSub:'邮件联系',featureHubFuture:'未来计划',featureHubFutureSub:'能力预告',releaseCenterTitle:'更新记录',releaseCenterText:'最近版本变化集中放在这里，首次打开时仍会弹出本次更新。',releaseCenterV141:'登记确认与离线修复',releaseCenterV200rc1:'发布候选',releaseCenterV200rc2:'产品救援',releaseCenterV140:'关注中心',releaseCenterV130:'本地 Agent Core',releaseCenterV120:'本地优先数据',releaseCenterV110:'模块化架构',releaseCenterV100rc:'正式稳定版',releaseCenterV098:'更新中心与反馈闭环',releaseCenterV097:'记录卡片操作增强',releaseCenterV096:'首页精简与功能中心',releaseCenterV095:'时刻精灵 2.0',releaseCenterV094:'个性化前置',releaseCenterV093:'产品体验打磨',viewCurrentRelease:'查看本次更新',personalizeDesc:'调整主题、语言和时刻精灵，让时刻更像你的助手。',chipTheme:'主题',chipLanguage:'语言',chipSprite:'小精灵',chipDisplay:'显示偏好',
    releaseTitle:'更新说明',releaseOk:'我知道了',releaseMeta:'当前版本 {version} · {time}',
    releaseNote1:'精灵登记前会清楚显示事项、日期、时间和类型。',releaseNote2:'确认卡新增修改入口，确认、修改、取消都不会提前写入。',releaseNote3:'确认按钮增加提交锁，连续点击只会保存一次。',releaseNote4:'修复关注中心页面位置和 Service Worker 缓存脚本。',releaseNote5:'本次不修改 NLP parser 与本地数据结构。',
    spriteTodayAction:'看今天',spriteBatchAction:'整理一段',spriteCalendarAction:'看日历',spriteExportAction:'导出日历',spriteBackupAction:'备份',spriteUpdateAction:'更新',spriteResetAction:'重置位置',spriteFutureHint:'时刻精灵助手已就绪。探索更多能力，正在规划中的功能也将在设置中开放。',
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    demoRouteTitle:'从一句话到日历',demoRouteText:'把一句话整理成时刻，再导出到你常用的日历。',
    demoRouteStep1:'输入一句话：明天下午三点开会',demoRouteStep2:'生成记录并进入日历',demoRouteStep3:'导出 .ics 到系统日历',demoRouteStep4:'导出 JSON 备份保护数据',
    importPreviewTitle:'导入预览',sourceTypeLabel:'文件类型',sourceNewBackup:'新版时刻备份',sourceLegacyArray:'旧版数组备份',sourceLegacyRecords:'旧版 records 备份',
    schemaVersionLabel:'schemaVersion',exportedAtLabel:'导出时间',totalImportLabel:'将导入记录数',validImportLabel:'有效记录',invalidImportLabel:'无效记录',
    missingIdLabel:'缺失 id',duplicateIdLabel:'重复 id',conflictIdLabel:'冲突 id',importModeLabel:'导入模式',appendImportMode:'追加导入',
    confirmImport:'确认导入',cancelImport:'取消',
    importData:'导入数据',clearData:'清空数据',backup:'数据备份',
    localDataHint:'数据默认保存在当前浏览器，可通过备份文件迁移。',
    exportDone:'备份文件已导出',exportFailed:'导出失败',importDone:'导入成功',importFailed:'文件格式错误',storageError:'存储空间已满',
    importConfirm:'将导入 {n} 条记录（合并到现有数据）',
    importConfirmDetail:'将追加导入 {n} 条记录。文件版本：{version}。导出时间：{exportedAt}。缺失 id：{missing}，重复 id：{duplicates}，现有冲突：{conflicts}，无效记录：{invalid}。确认后会合并到当前数据，不会清空现有记录。',
    importResult:'导入成功，新增 {added} 条，跳过 {skipped} 条无效记录',
    clockFormat:'YYYY年MM月DD日 HH:mm',
    emptyGreeting:'记录从此刻开始',daysText:'这是你来到时刻的第 {n} 天',userDaysText:'{name}，这是你来到时刻的第 {n} 天',
<<<<<<< HEAD
    nextReminder:'下一个提醒',recentRecords:'最近记录',topCards:'置顶时刻',emptyHint:'暂无记录',
=======
    nextReminder:'下一个提醒',recentRecords:'最近记录',topCards:'置顶时刻',emptyHint:'暂无记录',trashTitle:'回收站',trashEmpty:'回收站为空',restoreRecord:'恢复',permanentlyDelete:'永久删除',emptyTrash:'清空回收站',snapshotTitle:'数据快照',createSnapshot:'创建快照',restoreSnapshot:'恢复快照',deleteSnapshot:'删除快照',storagePersistence:'存储持久化',requestPersist:'请求持久化',undoText:'撤销',releaseCenterV200rc3:'v2.0.0-rc3 数据安全',
    testNotification:'测试通知',testDelayedReminder:'测试 1 分钟提醒',exportCalendar:'导出日历',
    pushBetaStatus:'推送 Beta 状态',pushBetaLocal:'仅本地 - 云推送未部署',
    reminderAdvice:'仅依靠本地网页无法保证浏览器完全关闭后准时提醒。',
    reminderCheckNote:'页面打开时会检查提醒；浏览器关闭后的后台提醒后续完善。',
    releaseCenterV200rc4:'v2.0.0-rc5 提醒可靠性',
    navSync:'同步',syncTitle:'同步設定',
    syncQuarantineTitle:'同步安全隔离',syncQuarantineMsg:'加密同步正在进行安全重构，当前仅使用本地模式。你的记录不会上传。',syncQuarantineDetail:'此前版本存在加密设计缺陷，远程同步已暂时禁用。安全重构完成后将重新开放。',syncDisabled:'已禁用（安全隔离）',syncMigrationPending:'正在恢复待同步的本地操作...',syncModeLocal:'本地模式',syncModeSync:'加密同步模式',
    deviceIdentity:'裝置身份',deviceId:'裝置ID',
    syncEndpoint:'同步伺服器',syncLastTime:'上次同步',syncPending:'待同步',
    analyticsConsent:'分析同意',localAnalytics:'本地分析',remoteAnalytics:'遠端分析',
    analyticsOff:'已關閉',analyticsOn:'已開啟',
    consentLocal:'記錄頁面訪問和功能使用（僅本地）',
    consentRemote:'上傳匿名使用統計（需要明確同意）',
    releaseCenterV200rc5:'v2.0.0-rc5 可選同步 Beta',
    navSync:'同步',syncTitle:'同步设置',
    syncModeLocal:'本地模式：数据仅保存在此设备',syncModeSync:'加密同步模式',
    deviceIdentity:'设备身份',deviceId:'设备ID',
    syncEndpoint:'同步服务器',syncLastTime:'上次同步',syncPending:'待同步',
    analyticsConsent:'分析同意',localAnalytics:'本地分析',remoteAnalytics:'远程分析',
    analyticsOff:'已关闭',analyticsOn:'已开启',
    consentLocal:'记录页面访问和功能使用（仅本地）',
    consentRemote:'上传匿名使用统计（需要明确同意）',
    releaseCenterV200rc5:'v2.0.0-rc5 可选同步 Beta',
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    today:'今天',tomorrow:'明天',dayAfter:'后天',minCountdown:'还有 {n} 分钟',hourCountdown:'还有 {h} 小时 {m} 分钟',
    dayCountdown:'还有 {d} 天',tomorrowTime:'明天 {t}',overdueMin:'已过 {n} 分钟',overdueHour:'已过 {h} 小时',
    overdueDay:'已过 {d} 天',now:'此刻',pinned:'置顶',coverRemove:'移除图片',coverUpload:'自选图片',
    presets:'预置',coverHint:'大卡片可换背景',
    weatherUnavail:'天气暂时不可用',weatherDenied:'未获得位置权限',weatherNoSupport:'当前浏览器不支持定位',
    weatherHint:'开启后首页显示当前位置天气',wechatVoiceHint:'微信内暂不支持语音，可用文字记录',
    notifyUnsupported:'不支持',notifyEnabled:'已开启',notifyDenied:'已拒绝',notifyOff:'未开启',
    notifyDeniedToast:'通知权限已拒绝',notifyOpenPageHint:'页面打开时检查提醒，浏览器关闭后不保证提醒。',
    notifyDueBody:'提醒时间到了',
    voiceListening:'正在听…',voiceProcessing:'识别中…',voiceReady:'点击话筒说话',
    saved:'已保存',emptyInput:'请输入内容',clearConfirm:'确定清空所有数据？此操作不可撤销。',
    storageRecovered:'本地数据异常，已保留恢复备份',
    deleted:'已删除',updated:'已更新',
    holidayNewYear:'元旦',holidaySpring:'春节',holidayLantern:'元宵',holidayQingming:'清明',
    holidayLabor:'劳动节',holidayDragon:'端午',holidayMidAutumn:'中秋',holidayNational:'国庆',
    holidayValentine:'情人节',holidayWomen:'妇女节',holidayTree:'植树节',holidayChildren:'儿童节',
    holidayTeacher:'教师节',holidayChristmas:'圣诞',
    mon_fmt:'{m}月',weekdays:['日','一','二','三','四','五','六'],
    sun:'周日',mon:'周一',tue:'周二',wed:'周三',thu:'周四',fri:'周五',sat:'周六',
    theme_paper:'米白',theme_mono:'黑白',theme_coffee:'暖棕',theme_mist:'雾蓝',theme_rose:'玫瑰',theme_forest:'森林',theme_night:'夜间',theme_sakura:'樱花',
    cardStyle:'卡片样式',cardLarge:'大卡片',cardNormal:'普通',accentColor:'主题色',
    noRecordsToday:'今日暂无记录',eventsToday:'今日有 {n} 件事',calQuickAddPh:'为这一天添加记录',
<<<<<<< HEAD
    jan:'1月',feb:'2月',mar:'3月',apr:'4月',may:'5月',jun:'6月',jul:'7月',aug:'8月',sep:'9月',oct:'10月',nov:'11月',dec:'12月'
  },
=======
    jan:'1月',feb:'2月',mar:'3月',apr:'4月',may:'5月',jun:'6月',jul:'7月',aug:'8月',sep:'9月',oct:'10月',nov:'11月',dec:'12月',reminderSettings:'提醒设置',reminderSettingsHint:'网页版提醒依赖浏览器环境。页面关闭后提醒不一定可靠，重要日程建议导出 .ics 到系统日历。',defaultLeadTime:'默认提前时间',atEventTime:'准时',permissionSettings:'权限设置',permissionSettingsHint:'查看和管理时刻使用的浏览器权限',microphonePerm:'麦克风',pwaInstallStatus:'PWA 安装',requestMic:'请求麦克风权限',requestStoragePersist:'请求持久化存储',dataBackup:'数据与备份',storagePersist:'持久化存储'},
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  'zh-TW':{
    appName:'時刻',tagline:'你的貼心記事助手',save:'儲存',cancel:'取消',delete:'刪除',edit:'編輯',
    inputPlaceholder:'試著寫下需要記住的事情',inputHint:'可識別時間、重複和紀念日，儲存後自動進入日曆',
    demoPrefix:'不知道寫什麼？',demoAction:'體驗示例',demoAlready:'示例已經在這裡了',
    demoAdded:'已新增 {n} 條示例記錄，可以在首頁、全部和日曆查看',
    todayOverview:'今日概覽',todayOverviewCount:'今天 {n} 個時刻',overviewNext:'最近',overviewAnniv:'紀念',
    overviewEmpty:'還沒有時刻。試試輸入「明天下午三點開會」。',overviewNoNext:'暫時沒有即將到來的安排',overviewNoAnniv:'還沒有紀念日',
    timelineTitle:'時間旅程線',timelineSub:'按時間看見你的安排',timelineToday:'今天',timelineTomorrow:'明天',timelineWeek:'本週',timelineFuture:'未來',timelineUndated:'無日期',
    timelineTodayCopy:'有 {n} 個時刻正在靠近',timelineTomorrowCopy:'有 {n} 個安排等待你',timelineWeekCopy:'還有 {n} 件事可以提前準備',timelineFutureCopy:'這些日子值得慢慢等',timelineUndatedCopy:'這些想法還沒有落到具體日期',
    timelineEmptyToday:'今天暫時很安靜',timelineEmptyTomorrow:'明天還沒有安排',timelineEmptyWeek:'本週剩餘時間暫無記錄',timelineEmptyFuture:'未來還沒有日期安排',timelineEmptyUndated:'無日期想法會出現在這裡',
    saveCardImage:'保存卡片',cardExportDone:'卡片圖片已生成',cardExportUnsupported:'目前瀏覽器暫不支援匯出圖片，可以截圖保存。',
    spriteName:'時刻精靈',spriteOpen:'打開時刻精靈',spriteClose:'收起時刻精靈',
    spriteInputAction:'寫一句',spriteDemoAction:'體驗示例',
    spriteEmptyMessage:'把一句話交給我，我幫你整理成一個時刻。',
    spriteDemoMessage:'不知道寫什麼？可以點體驗示例，看提醒、紀念、習慣和日曆怎麼連起來。',
    spriteSoonMessage:'最近有 {n} 個時刻快到了，記得看一眼。',
    spriteTodayMessage:'今天有 {n} 個時刻在等你。',
    spriteQuietMessage:'我會在這裡幫你留意最近的時刻。',
    spriteTodayLine:'今日 {n} 條',spriteNextLine:'最近：{title} · {when}',
    spriteTip1:'我可以幫你把一句話變成時刻。',spriteTip2:'今天有什麼安排，可以先看看首頁。',spriteTip3:'一段聊天也可以批量整理。',spriteTip4:'重要記錄記得匯出備份。',spriteTip5:'有日期的記錄可以匯出到系統日曆。',
<<<<<<< HEAD
    navHome:'首頁',navCal:'日曆',navAll:'全部',navWatch:'關注',navImport:'整理',navMy:'我的',
=======
    navHome:'首頁',navCal:'日曆',navAll:'全部',navImport:'整理',navMy:'我的',
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    allRecords:'全部記錄',searchRecords:'搜尋記錄',noSearchResult:'沒有找到相關記錄',
    all:'全部',reminder:'提醒',anniversary:'紀念',habit:'習慣',note:'備忘',
    close:'關閉',confirm:'確定',details:'詳情',setLarge:'大卡片',setNormal:'普通',setBg:'換背景',
    setPin:'置頂',unpin:'取消置頂',theme:'主題',setTheme:'主題',language:'語言',calendarMode:'日曆顯示',
    solar:'新曆',lunar:'農曆',weather:'首頁天氣',username:'用戶名',usernamePh:'設定你的名字',
    personalize:'個人化',about:'關於',enableNotify:'開啟通知',notifyPerm:'通知權限',
    replayIntro:'重播開場',batchImport:'批次整理',importHint:'每行一條，自動識別時間和類型。',
    parseImport:'識別內容',loadExample:'填入示例',uploadTxt:'上傳TXT',exportData:'匯出資料',
    calendarExport:'日曆匯出',calendarExportHint:'生成標準 .ics 檔案，可匯入 Google Calendar、Apple Calendar 或 Outlook。',
    exportIcs:'匯出全部日曆檔案',exportRecordIcs:'匯出日曆',icsExportDone:'日曆檔案已匯出',icsExportEmpty:'沒有可匯出的日期記錄',
    icsExportResult:'已匯出 {n} 條日曆記錄，略過 {skipped} 條無日期記錄',
    dataSafety:'資料安全',dataSafetyHint:'時刻的資料保存在目前瀏覽器。重要記錄建議定期匯出備份。',
    calendarImportGuideTitle:'如何匯入日曆',calendarImportGuide:'這是手動匯入標準日曆檔案：Google Calendar 在設定裡選擇「匯入和匯出」；Apple Calendar 可直接打開 .ics 或在日曆 App 匯入；Outlook 在匯入/訂閱日曆中選擇 .ics 檔案。',
    recordCountLabel:'目前記錄數',exportableCountLabel:'可匯出日曆數',undatedCountLabel:'無日期記錄數',lastBackupLabel:'上次備份',
    neverBackedUp:'尚未備份',backupSuggested:'記錄較多，建議匯出 JSON 備份。',backupLooksOk:'記錄不多，按需要備份即可。',
    backupVsCalendarHint:'JSON 備份用於恢復時刻資料；.ics 用於匯入第三方日曆，兩者不是一回事。',
    exportJsonBackup:'匯出 JSON 備份',importJsonBackup:'匯入 JSON 備份',storageEngineLabel:'資料倉庫',quarantineCountLabel:'隔離記錄',exportQuarantine:'匯出隔離資料',indexedDbMode:'IndexedDB 主倉庫',legacyFallbackMode:'本地快取回退',
    reminderNoticeTitle:'提醒說明',reminderNoticeText:'網頁版提醒依賴瀏覽器環境。頁面關閉後，長期提醒不一定可靠；建議將時刻加入桌面並定期打開查看，重要日程建議匯出 .ics 到系統日曆。',
    installPwa:'加入桌面',pwaInstallHint:'如果瀏覽器沒有顯示安裝按鈕，可使用瀏覽器選單中的「加入桌面」或「安裝應用」。',
    draftExisting:'已存在',draftDuplicateSkipped:'已略過重複草稿',batchSaveAll:'全部保存',
    batchSavedOnly:'已保存 {saved} 條',batchSavedResult:'已保存 {saved} 條，略過 {skipped} 條重複',batchSkippedOnly:'沒有新增，已略過 {skipped} 條重複',
    exampleRecordsTitle:'示例記錄',exampleRecordsText:'首次體驗時可一鍵生成 5 條示例記錄，不覆蓋真實資料。',
    feedbackTitle:'建議與回饋',feedbackText:'遇到問題或有建議，可以發郵件告訴我。',writeEmail:'寫郵件',copyEmail:'複製',feedbackCopied:'郵箱已複製',copyFeedbackTemplate:'複製回饋模板',feedbackTemplateCopied:'回饋模板已複製',feedbackTemplateLabel:'回饋時可以帶上這些資訊：',feedbackTemplateText:'遇到的問題：\n使用場景：\n瀏覽器/裝置：\n希望改進：',feedbackNoUpload:'這裡不接表單後端，也不會上傳你的本地資料。',copyRecord:'複製',recordCopied:'記錄已複製',moreActions:'更多',
<<<<<<< HEAD
    futurePlanTitle:'未來計劃',futurePlanText:'會繼續探索更主動的助手能力、更豐富的提醒方式、更好的日曆銜接和更穩定的資料保護。',futurePlan1:'更主動的助手能力。',futurePlan2:'更好的日曆銜接。',futurePlan3:'更豐富的提醒方式。',futurePlan4:'更安全的資料保護。',futurePlan5:'多裝置體驗探索。',productPositionTitle:'產品定位',productPositionText:'時刻不是替代日曆，而是幫你把聊天、通知和腦子裡的一句話，先整理成有時間感的記錄，再連接日曆匯出、備份和提醒說明。',capabilityChecklistTitle:'產品能力清單',capabilityChecklistText:'目前版本主要能力集中在本地記錄、整理、匯出和演示路徑上。',capabilityOneSentence:'一句話輸入',capabilityLocalSave:'本地保存',capabilityJsonBackup:'JSON 備份',capabilityIcsExport:'.ics 匯出',capabilityBatchOrganize:'批量整理',capabilityDedupe:'去重保護',capabilitySprite:'小熊助手',capabilityRecordActions:'記錄快捷操作',capabilityUpdateCenter:'更新中心',capabilityWatchCenter:'關注中心',capabilityFeedback:'回饋入口',featureHubTitle:'功能中心',featureHubText:'把示例、演示、更新、備份、日曆和回饋入口收在這裡。',featureHubDemo:'體驗示例',featureHubDemoSub:'生成 5 條示例',featureHubRoute:'演示路線',featureHubRouteSub:'從輸入到匯出',featureHubUpdates:'版本更新',featureHubUpdatesSub:'查看本次變化',featureHubSafety:'資料安全',featureHubSafetySub:'JSON 備份',featureHubCalendar:'日曆匯出',featureHubCalendarSub:'匯出 .ics',featureHubFeedback:'建議回饋',featureHubFeedbackSub:'郵件聯絡',featureHubFuture:'未來計劃',featureHubFutureSub:'能力預告',releaseCenterTitle:'更新記錄',releaseCenterText:'最近版本變化集中放在這裡，首次打開時仍會彈出本次更新。',releaseCenterV140:'關注中心',releaseCenterV130:'本地 Agent Core',releaseCenterV120:'本地優先資料',releaseCenterV110:'模組化架構',releaseCenterV100rc:'正式穩定版',releaseCenterV098:'更新中心與回饋閉環',releaseCenterV097:'記錄卡片操作增強',releaseCenterV096:'首頁精簡與功能中心',releaseCenterV095:'時刻精靈 2.0',releaseCenterV094:'個人化前置',releaseCenterV093:'產品體驗打磨',viewCurrentRelease:'查看本次更新',personalizeDesc:'調整主題、語言和時刻精靈，讓時刻更像你的助手。',chipTheme:'主題',chipLanguage:'語言',chipSprite:'小精靈',chipDisplay:'顯示偏好',
    releaseTitle:'更新說明',releaseOk:'我知道了',releaseMeta:'目前版本 {version} · {time}',
    releaseNote1:'小熊新增透明的本地 Agent 對話入口，執行前會顯示意圖、工具與確認級別。',releaseNote2:'搜尋、今日概覽、開啟頁面與切換主題可直接執行；建立、置頂與匯出需要確認。',releaseNote3:'刪除記錄必須二次確認，工具參數會校驗，不能執行使用者輸入的程式或命令。',releaseNote4:'對話保存在本地 IndexedDB，目前主要使用本地規則，不假裝聯網 AI。',releaseNote5:'更新中心記錄 v1.3.0 本地 Agent Core。',
    spriteTodayAction:'看今天',spriteBatchAction:'整理一段',spriteCalendarAction:'看日曆',spriteExportAction:'匯出日曆',spriteBackupAction:'備份',spriteUpdateAction:'更新',spriteResetAction:'重置位置',spriteFutureHint:'更主動的智慧助手能力正在規劃中。',
=======
    futurePlanTitle:'未來計劃',futurePlanText:'會繼續探索更主動的助手能力、更豐富的提醒方式、更好的日曆銜接和更穩定的資料保護。',futurePlan1:'更主動的助手能力。',futurePlan2:'更好的日曆銜接。',futurePlan3:'更豐富的提醒方式。',futurePlan4:'更安全的資料保護。',futurePlan5:'多裝置體驗探索。',productPositionTitle:'產品定位',productPositionText:'時刻不是替代日曆，而是幫你把聊天、通知和腦子裡的一句話，先整理成有時間感的記錄，再連接日曆匯出、備份和提醒說明。',capabilityChecklistTitle:'產品能力清單',capabilityChecklistText:'目前版本主要能力集中在本地記錄、整理、匯出和演示路徑上。',capabilityOneSentence:'一句話輸入',capabilityLocalSave:'本地保存',capabilityJsonBackup:'JSON 備份',capabilityIcsExport:'.ics 匯出',capabilityBatchOrganize:'批量整理',capabilityDedupe:'去重保護',capabilitySprite:'小熊助手',capabilityRecordActions:'記錄快捷操作',capabilityUpdateCenter:'更新中心',capabilityFeedback:'回饋入口',featureHubTitle:'功能中心',featureHubText:'把示例、演示、更新、備份、日曆和回饋入口收在這裡。',featureHubDemo:'體驗示例',featureHubDemoSub:'生成 5 條示例',featureHubRoute:'演示路線',featureHubRouteSub:'從輸入到匯出',featureHubUpdates:'版本更新',featureHubUpdatesSub:'查看本次變化',featureHubSafety:'資料安全',featureHubSafetySub:'JSON 備份',featureHubCalendar:'日曆匯出',featureHubCalendarSub:'匯出 .ics',featureHubFeedback:'建議回饋',featureHubFeedbackSub:'郵件聯絡',featureHubFuture:'未來計劃',featureHubFutureSub:'能力預告',releaseCenterTitle:'更新記錄',releaseCenterText:'最近版本變化集中放在這裡，首次打開時仍會彈出本次更新。',releaseCenterV141:'登記確認與離線修復',releaseCenterV200rc1:'發布候選',releaseCenterV200rc2:'產品救援',releaseCenterV140:'關注中心',releaseCenterV130:'本地 Agent Core',releaseCenterV120:'本地優先資料',releaseCenterV110:'模組化架構',releaseCenterV100rc:'正式穩定版',releaseCenterV098:'更新中心與回饋閉環',releaseCenterV097:'記錄卡片操作增強',releaseCenterV096:'首頁精簡與功能中心',releaseCenterV095:'時刻精靈 2.0',releaseCenterV094:'個人化前置',releaseCenterV093:'產品體驗打磨',viewCurrentRelease:'查看本次更新',personalizeDesc:'調整主題、語言和時刻精靈，讓時刻更像你的助手。',chipTheme:'主題',chipLanguage:'語言',chipSprite:'小精靈',chipDisplay:'顯示偏好',
    releaseTitle:'更新說明',releaseOk:'我知道了',releaseMeta:'目前版本 {version} · {time}',
    releaseNote1:'精靈登記前會清楚顯示事項、日期、時間和類型。',releaseNote2:'確認卡新增修改入口，確認、修改、取消都不會提前寫入。',releaseNote3:'確認按鈕增加提交鎖，連續點擊只會保存一次。',releaseNote4:'修復關注中心頁面位置和 Service Worker 快取腳本。',releaseNote5:'本次不修改 NLP parser 與本地資料結構。',
    spriteTodayAction:'看今天',spriteBatchAction:'整理一段',spriteCalendarAction:'看日曆',spriteExportAction:'匯出日曆',spriteBackupAction:'備份',spriteUpdateAction:'更新',spriteResetAction:'重置位置',spriteFutureHint:'時刻精靈助手已就緒。探索更多能力，正在規劃中的功能也將在設定中開放。',
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    demoRouteTitle:'從一句話到日曆',demoRouteText:'把一句話整理成時刻，再匯出到你常用的日曆。',
    demoRouteStep1:'輸入一句話：明天下午三點開會',demoRouteStep2:'生成記錄並進入日曆',demoRouteStep3:'匯出 .ics 到系統日曆',demoRouteStep4:'匯出 JSON 備份保護資料',
    importPreviewTitle:'匯入預覽',sourceTypeLabel:'檔案類型',sourceNewBackup:'新版時刻備份',sourceLegacyArray:'舊版陣列備份',sourceLegacyRecords:'舊版 records 備份',
    schemaVersionLabel:'schemaVersion',exportedAtLabel:'匯出時間',totalImportLabel:'將匯入記錄數',validImportLabel:'有效記錄',invalidImportLabel:'無效記錄',
    missingIdLabel:'缺失 id',duplicateIdLabel:'重複 id',conflictIdLabel:'衝突 id',importModeLabel:'匯入模式',appendImportMode:'追加匯入',
    confirmImport:'確認匯入',cancelImport:'取消',
    importData:'匯入資料',clearData:'清空資料',backup:'資料備份',
    localDataHint:'資料預設保存在目前瀏覽器，可透過備份檔案遷移。',
    exportDone:'備份檔案已匯出',exportFailed:'匯出失敗',importDone:'匯入成功',importFailed:'檔案格式錯誤',storageError:'儲存空間已滿',
    importConfirm:'將匯入 {n} 條記錄（合併到現有資料）',
    importConfirmDetail:'將追加匯入 {n} 條記錄。檔案版本：{version}。匯出時間：{exportedAt}。缺失 id：{missing}，重複 id：{duplicates}，現有衝突：{conflicts}，無效記錄：{invalid}。確認後會合併到目前資料，不會清空現有記錄。',
    importResult:'匯入成功，新增 {added} 條，略過 {skipped} 條無效記錄',
    clockFormat:'YYYY年MM月DD日 HH:mm',
<<<<<<< HEAD
    daysText:'這是你來到時刻的第 {n} 天',userDaysText:'{name}，這是你來到時刻的第 {n} 天',
    nextReminder:'下一個提醒',recentRecords:'最近記錄',topCards:'置頂時刻',emptyHint:'暫無記錄',
=======
    emptyGreeting:'記錄從此刻開始',daysText:'這是你來到時刻的第 {n} 天',userDaysText:'{name}，這是你來到時刻的第 {n} 天',
    nextReminder:'下一個提醒',recentRecords:'最近記錄',topCards:'置頂時刻',emptyHint:'暫無記錄',trashTitle:'回收站',trashEmpty:'回收站為空',restoreRecord:'恢復',permanentlyDelete:'永久刪除',emptyTrash:'清空回收站',snapshotTitle:'資料快照',createSnapshot:'建立快照',restoreSnapshot:'恢復快照',deleteSnapshot:'刪除快照',storagePersistence:'儲存持久化',requestPersist:'請求持久化',undoText:'撤銷',releaseCenterV200rc3:'v2.0.0-rc3 資料安全',
    testNotification:'測試通知',testDelayedReminder:'測試 1 分鐘提醒',exportCalendar:'匯出日曆',
    pushBetaStatus:'推送 Beta 狀態',pushBetaLocal:'僅本地 - 雲推送未部署',
    reminderAdvice:'僅依靠本地網頁無法保證瀏覽器完全關閉後準時提醒。',
    reminderCheckNote:'頁面開啟時會檢查提醒；瀏覽器關閉後的系統級提醒後續完善。',
    releaseCenterV200rc4:'v2.0.0-rc5 提醒可靠性',
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    today:'今天',tomorrow:'明天',dayAfter:'後天',minCountdown:'還有 {n} 分鐘',hourCountdown:'還有 {h} 小時 {m} 分鐘',
    dayCountdown:'還有 {d} 天',tomorrowTime:'明天 {t}',overdueMin:'已過 {n} 分鐘',overdueHour:'已過 {h} 小時',
    overdueDay:'已過 {d} 天',now:'此刻',pinned:'置頂',coverRemove:'移除圖片',coverUpload:'自選圖片',
    presets:'預置',coverHint:'大卡片可換背景',
    weatherUnavail:'天氣暫時不可用',weatherDenied:'未獲得位置權限',weatherNoSupport:'當前瀏覽器不支援定位',
    weatherHint:'開啟後首頁顯示當前位置天氣',wechatVoiceHint:'微信內暫不支援語音，可用文字記錄',
    notifyUnsupported:'不支援',notifyEnabled:'已開啟',notifyDenied:'已拒絕',notifyOff:'未開啟',
    notifyDeniedToast:'通知權限已拒絕',notifyOpenPageHint:'頁面開啟時檢查提醒，瀏覽器關閉後不保證提醒。',
    notifyDueBody:'提醒時間到了',
    voiceListening:'正在聽…',voiceProcessing:'識別中…',voiceReady:'點擊話筒說話',
    saved:'已儲存',emptyInput:'請輸入內容',clearConfirm:'確定清空所有資料？此操作不可撤銷。',
    storageRecovered:'本地資料異常，已保留恢復備份',
    deleted:'已刪除',updated:'已更新',
    holidayNewYear:'元旦',holidaySpring:'春節',holidayLantern:'元宵',holidayQingming:'清明',
    holidayLabor:'勞動節',holidayDragon:'端午',holidayMidAutumn:'中秋',holidayNational:'國慶',
    holidayValentine:'情人節',holidayWomen:'婦女節',holidayTree:'植樹節',holidayChildren:'兒童節',
    holidayTeacher:'教師節',holidayChristmas:'聖誕',
    mon_fmt:'{m}月',weekdays:['日','一','二','三','四','五','六'],
    sun:'週日',mon:'週一',tue:'週二',wed:'週三',thu:'週四',fri:'週五',sat:'週六',
    theme_paper:'米白',theme_mono:'黑白',theme_coffee:'暖棕',theme_mist:'霧藍',theme_rose:'玫瑰',theme_forest:'森林',theme_night:'夜間',theme_sakura:'櫻花',
    cardStyle:'卡片樣式',cardLarge:'大卡片',cardNormal:'普通',accentColor:'主題色',
    noRecordsToday:'今日暫無記錄',eventsToday:'今日有 {n} 件事',calQuickAddPh:'為這一天新增記錄',
<<<<<<< HEAD
    jan:'1月',feb:'2月',mar:'3月',apr:'4月',may:'5月',jun:'6月',jul:'7月',aug:'8月',sep:'9月',oct:'10月',nov:'11月',dec:'12月'
  },
=======
    jan:'1月',feb:'2月',mar:'3月',apr:'4月',may:'5月',jun:'6月',jul:'7月',aug:'8月',sep:'9月',oct:'10月',nov:'11月',dec:'12月',reminderSettings:'提醒設定',reminderSettingsHint:'網頁版提醒依賴瀏覽器環境。頁面關閉後提醒不一定可靠，重要日程建議匯出 .ics 到系統日曆。',defaultLeadTime:'默認提前時間',atEventTime:'準時',permissionSettings:'權限設定',permissionSettingsHint:'查看和管理時刻使用的瀏覽器權限',microphonePerm:'麥克風',pwaInstallStatus:'PWA 安裝',requestMic:'請求麥克風權限',requestStoragePersist:'請求持久化存儲',dataBackup:'數據與備份',storagePersist:'持久化存儲'},
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  'en':{
    appName:'Shike',tagline:'Your personal time keeper',save:'Save',cancel:'Cancel',delete:'Delete',edit:'Edit',
    inputPlaceholder:'Write what you need to remember',inputHint:'Times, repeats, and anniversaries are detected automatically.',
    demoPrefix:'Not sure what to add?',demoAction:'Try examples',demoAlready:'The examples are already here',
    demoAdded:'Added {n} example records. View them on Home, All, and Calendar.',
    todayOverview:'Today overview',todayOverviewCount:'{n} moments today',overviewNext:'Next',overviewAnniv:'Anniversary',
    overviewEmpty:'No moments yet. Try “meeting tomorrow at 3pm”.',overviewNoNext:'No upcoming schedule yet',overviewNoAnniv:'No anniversaries yet',
    timelineTitle:'Time journey',timelineSub:'See your moments by time',timelineToday:'Today',timelineTomorrow:'Tomorrow',timelineWeek:'This week',timelineFuture:'Future',timelineUndated:'Undated',
    timelineTodayCopy:'{n} moments are close today',timelineTomorrowCopy:'{n} arrangements are waiting',timelineWeekCopy:'{n} things can be prepared this week',timelineFutureCopy:'These days are worth waiting for',timelineUndatedCopy:'These ideas do not have dates yet',
    timelineEmptyToday:'Today is quiet for now',timelineEmptyTomorrow:'Tomorrow has no arrangement yet',timelineEmptyWeek:'No more records this week',timelineEmptyFuture:'No future dated records yet',timelineEmptyUndated:'Undated ideas will appear here',
    saveCardImage:'Save card',cardExportDone:'Card image generated',cardExportUnsupported:'This browser cannot export images yet. You can save a screenshot instead.',
    spriteName:'Shike sprite',spriteOpen:'Open Shike sprite',spriteClose:'Collapse Shike sprite',
    spriteInputAction:'Write one',spriteDemoAction:'Try examples',
    spriteEmptyMessage:'Give me one sentence, and I will turn it into a moment.',
    spriteDemoMessage:'Not sure what to add? Try examples to see reminders, anniversaries, habits, and calendar dots.',
    spriteSoonMessage:'{n} moments are coming up soon.',
    spriteTodayMessage:'You have {n} moments today.',
    spriteQuietMessage:'I will keep an eye on your upcoming moments here.',
    spriteTodayLine:'Today {n}',spriteNextLine:'Next: {title} · {when}',
    spriteTip1:'I can turn one sentence into a Shike moment.',spriteTip2:'Start with Home to see what is due today.',spriteTip3:'A paragraph of chat can be organized in batch.',spriteTip4:'Export backups for important records.',spriteTip5:'Dated records can be exported to your system calendar.',
<<<<<<< HEAD
    navHome:'Home',navCal:'Calendar',navAll:'All',navWatch:'Watch',navImport:'Organize',navMy:'Me',
=======
    navHome:'Home',navCal:'Calendar',navAll:'All',navImport:'Organize',navMy:'Me',
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    allRecords:'All records',searchRecords:'Search records',noSearchResult:'No matching records',
    all:'All',reminder:'Reminder',anniversary:'Anniversary',habit:'Habit',note:'Note',
    close:'Close',confirm:'OK',details:'Details',setLarge:'Large Card',setNormal:'Normal',setBg:'Background',
    setPin:'Pin',unpin:'Unpin',theme:'Theme',setTheme:'Theme',language:'Language',calendarMode:'Calendar',
    solar:'Solar',lunar:'Lunar',weather:'Weather',username:'Name',usernamePh:'Set your name',
    personalize:'Personalize',about:'About',enableNotify:'Enable notifications',notifyPerm:'Notifications',
    replayIntro:'Replay intro',batchImport:'Batch organize',importHint:'One per line. Times and types auto-detected.',
    parseImport:'Parse',loadExample:'Load example',uploadTxt:'Upload TXT',exportData:'Export',
    calendarExport:'Calendar export',calendarExportHint:'Generate a standard .ics file for Google Calendar, Apple Calendar, or Outlook import.',
    exportIcs:'Export calendar file',exportRecordIcs:'Export calendar',icsExportDone:'Calendar file exported',icsExportEmpty:'No dated records to export',
    icsExportResult:'Exported {n} calendar records, skipped {skipped} undated records',
    dataSafety:'Data safety',dataSafetyHint:'Shike data is stored in this browser. Export backups regularly for important records.',
    calendarImportGuideTitle:'How to import calendars',calendarImportGuide:'This is a manual standard calendar file import: in Google Calendar, use Settings then Import and export; Apple Calendar can open the .ics file or import it in the Calendar app; Outlook can import or subscribe to a calendar from an .ics file.',
    recordCountLabel:'Current records',exportableCountLabel:'Calendar exportable',undatedCountLabel:'Undated records',lastBackupLabel:'Last backup',
    neverBackedUp:'No backup yet',backupSuggested:'You have several records. Export a JSON backup.',backupLooksOk:'Few records so far. Back up when needed.',
    backupVsCalendarHint:'JSON backups restore Shike data; .ics files import into third-party calendars. They are different files.',
    exportJsonBackup:'Export JSON backup',importJsonBackup:'Import JSON backup',storageEngineLabel:'Data repository',quarantineCountLabel:'Quarantined records',exportQuarantine:'Export quarantine',indexedDbMode:'IndexedDB primary',legacyFallbackMode:'Local cache fallback',
    reminderNoticeTitle:'Reminder notes',reminderNoticeText:'Web reminders depend on the browser environment. After the page is closed, long-term reminders are not guaranteed. Add Shike to your desktop and open it regularly; export important schedules as .ics to your system calendar.',
    installPwa:'Add to desktop',pwaInstallHint:'If the browser does not show an install button, use the browser menu to add to desktop or install the app.',
    draftExisting:'Existing',draftDuplicateSkipped:'Duplicate draft skipped',batchSaveAll:'Save all',
    batchSavedOnly:'Saved {saved}',batchSavedResult:'Saved {saved}, skipped {skipped} duplicates',batchSkippedOnly:'Nothing new, skipped {skipped} duplicates',
    exampleRecordsTitle:'Example records',exampleRecordsText:'Create 5 example records for first-time review without overwriting real data.',
    feedbackTitle:'Feedback',feedbackText:'If you find an issue or have an idea, send an email.',writeEmail:'Email',copyEmail:'Copy',feedbackCopied:'Email copied',copyFeedbackTemplate:'Copy feedback template',feedbackTemplateCopied:'Feedback template copied',feedbackTemplateLabel:'Useful details to include:',feedbackTemplateText:'Issue:\nUse case:\nBrowser/device:\nWhat you hope improves:',feedbackNoUpload:'No backend form is connected here, and your local data is not uploaded.',copyRecord:'Copy',recordCopied:'Record copied',moreActions:'More',
<<<<<<< HEAD
    futurePlanTitle:'Future plans',futurePlanText:'We will keep exploring more proactive assistance, richer reminders, better calendar handoff, and stronger data protection.',futurePlan1:'More proactive assistant abilities.',futurePlan2:'Better calendar handoff.',futurePlan3:'Richer reminder options.',futurePlan4:'Safer data protection.',futurePlan5:'Multi-device experience exploration.',productPositionTitle:'Product position',productPositionText:'Shike is not a calendar replacement. It helps turn one sentence from chat, notifications, or your mind into time-aware records, then connects them to calendar export, backup, and reminder notes.',capabilityChecklistTitle:'Product capability checklist',capabilityChecklistText:'This version focuses on local records, organization, export, and the demo path.',capabilityOneSentence:'One-sentence input',capabilityLocalSave:'Local save',capabilityJsonBackup:'JSON backup',capabilityIcsExport:'.ics export',capabilityBatchOrganize:'Batch organize',capabilityDedupe:'Dedupe protection',capabilitySprite:'Bear assistant',capabilityRecordActions:'Record quick actions',capabilityUpdateCenter:'Update center',capabilityWatchCenter:'Watch center',capabilityFeedback:'Feedback entry',featureHubTitle:'Feature hub',featureHubText:'Examples, demo route, updates, backup, calendar, and feedback live here.',featureHubDemo:'Try examples',featureHubDemoSub:'Create 5 examples',featureHubRoute:'Demo route',featureHubRouteSub:'Input to export',featureHubUpdates:'Updates',featureHubUpdatesSub:'What changed',featureHubSafety:'Data safety',featureHubSafetySub:'JSON backup',featureHubCalendar:'Calendar export',featureHubCalendarSub:'Export .ics',featureHubFeedback:'Feedback',featureHubFeedbackSub:'Email contact',featureHubFuture:'Future plans',featureHubFutureSub:'Roadmap preview',releaseCenterTitle:'Update history',releaseCenterText:'Recent version changes live here. First open still shows the current release note.',releaseCenterV140:'Watch center',releaseCenterV130:'Local Agent Core',releaseCenterV120:'Local-first data',releaseCenterV110:'Modular architecture',releaseCenterV100rc:'Stable release',releaseCenterV098:'Update center and feedback loop',releaseCenterV097:'Record card action polish',releaseCenterV096:'Home cleanup and feature hub',releaseCenterV095:'Time sprite 2.0',releaseCenterV094:'Personalization moved forward',releaseCenterV093:'Product experience polish',viewCurrentRelease:'View this update',personalizeDesc:'Adjust theme, language and the time sprite to make Shike yours.',chipTheme:'Theme',chipLanguage:'Language',chipSprite:'Sprite',chipDisplay:'Display',
    releaseTitle:'What changed',releaseOk:'Got it',releaseMeta:'Current version {version} · {time}',
    releaseNote1:'The bear now has a transparent local Agent entry that previews intent, tool, and confirmation level.',releaseNote2:'Search, Today, page navigation, and themes can run directly; creation, pinning, and exports require confirmation.',releaseNote3:'Record deletion always requires double confirmation and tool arguments are validated.',releaseNote4:'Conversations stay in local IndexedDB and the assistant clearly identifies its local-rule limits.',releaseNote5:'The update center records the v1.3.0 local Agent Core release.',
    spriteTodayAction:'Today',spriteBatchAction:'Organize',spriteCalendarAction:'Calendar',spriteExportAction:'Export calendar',spriteBackupAction:'Backup',spriteUpdateAction:'Updates',spriteResetAction:'Reset position',spriteFutureHint:'More proactive assistant abilities are being planned.',
=======
    futurePlanTitle:'Future plans',futurePlanText:'We will keep exploring more proactive assistance, richer reminders, better calendar handoff, and stronger data protection.',futurePlan1:'More proactive assistant abilities.',futurePlan2:'Better calendar handoff.',futurePlan3:'Richer reminder options.',futurePlan4:'Safer data protection.',futurePlan5:'Multi-device experience exploration.',productPositionTitle:'Product position',productPositionText:'Shike is not a calendar replacement. It helps turn one sentence from chat, notifications, or your mind into time-aware records, then connects them to calendar export, backup, and reminder notes.',capabilityChecklistTitle:'Product capability checklist',capabilityChecklistText:'This version focuses on local records, organization, export, and the demo path.',capabilityOneSentence:'One-sentence input',capabilityLocalSave:'Local save',capabilityJsonBackup:'JSON backup',capabilityIcsExport:'.ics export',capabilityBatchOrganize:'Batch organize',capabilityDedupe:'Dedupe protection',capabilitySprite:'Bear assistant',capabilityRecordActions:'Record quick actions',capabilityUpdateCenter:'Update center',capabilityFeedback:'Feedback entry',featureHubTitle:'Feature hub',featureHubText:'Examples, demo route, updates, backup, calendar, and feedback live here.',featureHubDemo:'Try examples',featureHubDemoSub:'Create 5 examples',featureHubRoute:'Demo route',featureHubRouteSub:'Input to export',featureHubUpdates:'Updates',featureHubUpdatesSub:'What changed',featureHubSafety:'Data safety',featureHubSafetySub:'JSON backup',featureHubCalendar:'Calendar export',featureHubCalendarSub:'Export .ics',featureHubFeedback:'Feedback',featureHubFeedbackSub:'Email contact',featureHubFuture:'Future plans',featureHubFutureSub:'Roadmap preview',releaseCenterTitle:'Update history',releaseCenterText:'Recent version changes live here. First open still shows the current release note.',releaseCenterV141:'Confirmation and offline fixes',releaseCenterV200rc1:'Release Candidate',releaseCenterV200rc2:'Product Rescue',releaseCenterV140:'Watch Center',releaseCenterV130:'Local Agent Core',releaseCenterV120:'Local-first data',releaseCenterV110:'Modular architecture',releaseCenterV100rc:'Stable release',releaseCenterV098:'Update center and feedback loop',releaseCenterV097:'Record card action polish',releaseCenterV096:'Home cleanup and feature hub',releaseCenterV095:'Time sprite 2.0',releaseCenterV094:'Personalization moved forward',releaseCenterV093:'Product experience polish',viewCurrentRelease:'View this update',personalizeDesc:'Adjust theme, language and the time sprite to make Shike yours.',chipTheme:'Theme',chipLanguage:'Language',chipSprite:'Sprite',chipDisplay:'Display',
    releaseTitle:'What changed',releaseOk:'Got it',releaseMeta:'Current version {version} · {time}',
    releaseNote1:'The assistant now previews the item, date, time, and type before saving.',releaseNote2:'The confirmation card supports modify and cancel without writing early.',releaseNote3:'A submission lock prevents repeated confirmation from creating duplicates.',releaseNote4:'This patch fixes Watch Center placement and the Service Worker cache script.',releaseNote5:'The NLP parser and local data schema are unchanged.',
    spriteTodayAction:'Today',spriteBatchAction:'Organize',spriteCalendarAction:'Calendar',spriteExportAction:'Export calendar',spriteBackupAction:'Backup',spriteUpdateAction:'Updates',spriteResetAction:'Reset position',spriteFutureHint:'Time sprite assistant is ready. Explore more abilities, features being planned will be available in settings.',
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    demoRouteTitle:'From one sentence to calendar',demoRouteText:'Turn one sentence into a moment, then export it to your calendar.',
    demoRouteStep1:'Enter one sentence: meeting tomorrow at 3pm',demoRouteStep2:'Create a record and calendar dot',demoRouteStep3:'Export .ics to your system calendar',demoRouteStep4:'Export JSON backup to protect data',
    importPreviewTitle:'Import preview',sourceTypeLabel:'File type',sourceNewBackup:'New Shike backup',sourceLegacyArray:'Legacy array backup',sourceLegacyRecords:'Legacy records backup',
    schemaVersionLabel:'schemaVersion',exportedAtLabel:'Exported at',totalImportLabel:'Records in file',validImportLabel:'Valid records',invalidImportLabel:'Invalid records',
    missingIdLabel:'Missing id',duplicateIdLabel:'Duplicate id',conflictIdLabel:'Conflicting id',importModeLabel:'Import mode',appendImportMode:'Append import',
    confirmImport:'Confirm import',cancelImport:'Cancel',
    importData:'Import',clearData:'Clear all',backup:'Backup',
    localDataHint:'Data is saved in this browser by default and can be moved with a backup file.',
    exportDone:'Backup exported',exportFailed:'Export failed',importDone:'Imported',importFailed:'Invalid file format',storageError:'Storage is full',
    importConfirm:'Import {n} records and merge them with current data',
    importConfirmDetail:'Append {n} records. File version: {version}. Exported at: {exportedAt}. Missing ids: {missing}, duplicate ids: {duplicates}, existing conflicts: {conflicts}, invalid records: {invalid}. Current data will not be cleared.',
    importResult:'Imported {added} records, skipped {skipped} invalid records',
    clockFormat:'{month} {day}, {year} {hour}:{min}',
<<<<<<< HEAD
    daysText:'Day {n} with Shike',userDaysText:'{name}, day {n} with Shike',
    nextReminder:'Next up',recentRecords:'Recent',topCards:'Pinned',emptyHint:'No records yet',
=======
    emptyGreeting:'Your journey starts here',daysText:'Day {n} with Shike',userDaysText:'{name}, day {n} with Shike',
    nextReminder:'Next up',recentRecords:'Recent',topCards:'Pinned',emptyHint:'No records yet',trashTitle:'Trash',trashEmpty:'Trash is empty',restoreRecord:'Restore',permanentlyDelete:'Delete Forever',emptyTrash:'Empty Trash',snapshotTitle:'Snapshots',createSnapshot:'Create Snapshot',restoreSnapshot:'Restore',deleteSnapshot:'Delete',storagePersistence:'Storage Persistence',requestPersist:'Request Persistence',undoText:'Undo',releaseCenterV200rc3:'v2.0.0-rc3 Data Safety',
    testNotification:'Test Notification',testDelayedReminder:'Test 1-min Reminder',exportCalendar:'Export Calendar',
    pushBetaStatus:'Push Beta Status',pushBetaLocal:'Local only - cloud push not deployed',
    reminderAdvice:'Local web pages cannot guarantee timely reminders when browser is fully closed.',
    reminderCheckNote:'Reminders are checked when page is open; system-level reminders for closed browser will be added later.',
    releaseCenterV200rc4:'v2.0.0-rc5 Reminder Reliability',
    navSync:'Sync',syncTitle:'Sync Settings',
    syncModeLocal:'Local mode: data stays on this device only',syncModeSync:'Encrypted sync mode',
    deviceIdentity:'Device Identity',deviceId:'Device ID',
    syncEndpoint:'Sync Server',syncLastTime:'Last Sync',syncPending:'Pending',
    analyticsConsent:'Analytics Consent',localAnalytics:'Local Analytics',remoteAnalytics:'Remote Analytics',
    analyticsOff:'Off',analyticsOn:'On',
    consentLocal:'Record page visits and feature usage (local only)',
    consentRemote:'Upload anonymous usage stats (requires explicit consent)',
    releaseCenterV200rc5:'v2.0.0-rc5 Optional Sync Beta',
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    today:'Today',tomorrow:'Tomorrow',dayAfter:'Day after',minCountdown:'{n} min left',hourCountdown:'{h}h {m}m left',
    dayCountdown:'{d} days left',tomorrowTime:'Tomorrow {t}',overdueMin:'{n} min overdue',overdueHour:'{h}h overdue',
    overdueDay:'{d} days overdue',now:'Now',pinned:'Pinned',coverRemove:'Remove image',coverUpload:'Upload image',
    presets:'Presets',coverHint:'Large cards support backgrounds',
    weatherUnavail:'Weather unavailable',weatherDenied:'Location permission denied',weatherNoSupport:'Geolocation not supported',
    weatherHint:'Show local weather on home',wechatVoiceHint:'Voice not supported in WeChat, use text instead',
    notifyUnsupported:'Unsupported',notifyEnabled:'On',notifyDenied:'Denied',notifyOff:'Off',
    notifyDeniedToast:'Notification permission denied',notifyOpenPageHint:'Reminders are checked while this page is open; browser-close delivery is not guaranteed.',
    notifyDueBody:'Reminder time',
    voiceListening:'Listening…',voiceProcessing:'Processing…',voiceReady:'Tap mic to speak',
    saved:'Saved',emptyInput:'Please enter something',clearConfirm:'Clear all data? This cannot be undone.',
    storageRecovered:'Local data issue detected; recovery copy kept',
    deleted:'Deleted',updated:'Updated',
    holidayNewYear:"New Year",holidaySpring:'Spring Festival',holidayLantern:'Lantern Fest.',holidayQingming:'Qingming',
    holidayLabor:'Labor Day',holidayDragon:'Dragon Boat',holidayMidAutumn:'Mid-Autumn',holidayNational:'National Day',
    holidayValentine:"Valentine's",holidayWomen:"Women's Day",holidayTree:'Arbor Day',holidayChildren:"Children's Day",
    holidayTeacher:"Teacher's Day",holidayChristmas:'Christmas',
    mon_fmt:'Month {m}',weekdays:['S','M','T','W','T','F','S'],
    sun:'Sun',mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri',sat:'Sat',
    theme_paper:'Paper',theme_mono:'Mono',theme_coffee:'Coffee',theme_mist:'Mist',theme_rose:'Rose',theme_forest:'Forest',theme_night:'Night',theme_sakura:'Sakura',
    cardStyle:'Card style',cardLarge:'Large',cardNormal:'Normal',accentColor:'Accent',
    noRecordsToday:'Nothing today',eventsToday:'{n} events today',calQuickAddPh:'Add a record for this day',
<<<<<<< HEAD
    jan:'Jan',feb:'Feb',mar:'Mar',apr:'Apr',may:'May',jun:'Jun',jul:'Jul',aug:'Aug',sep:'Sep',oct:'Oct',nov:'Nov',dec:'Dec'
  },
=======
    jan:'Jan',feb:'Feb',mar:'Mar',apr:'Apr',may:'May',jun:'Jun',jul:'Jul',aug:'Aug',sep:'Sep',oct:'Oct',nov:'Nov',dec:'Dec',reminderSettings:'Reminder Settings',reminderSettingsHint:'Web reminders depend on the browser environment. Reminders may not be reliable when the page is closed. Export important schedules as .ics to your system calendar.',defaultLeadTime:'Default Lead Time',atEventTime:'At event time',permissionSettings:'Permissions',permissionSettingsHint:'View and manage browser permissions used by Shike',microphonePerm:'Microphone',pwaInstallStatus:'PWA Install',requestMic:'Request Microphone',requestStoragePersist:'Request Persistent Storage',dataBackup:'Data & Backup',storagePersist:'Persistent Storage'},
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  'ja':{
    appName:'時刻',tagline:'あなたの大切な時間を記録',save:'保存',cancel:'キャンセル',delete:'削除',edit:'編集',
    inputPlaceholder:'覚えておきたいことを書いてください',inputHint:'時間・繰り返し・記念日を自動で認識します',
    demoPrefix:'何を書くか迷ったら',demoAction:'例を試す',demoAlready:'例はすでに追加されています',
    demoAdded:'{n} 件のサンプル記録を追加しました。ホーム・一覧・カレンダーで確認できます',
    todayOverview:'今日の概要',todayOverviewCount:'今日は {n} 件',overviewNext:'次',overviewAnniv:'記念',
    overviewEmpty:'まだ時刻がありません。「明日の午後3時に会議」と入力してみてください。',overviewNoNext:'近い予定はまだありません',overviewNoAnniv:'記念日はまだありません',
    timelineTitle:'時間の旅路',timelineSub:'時間順に時刻を見る',timelineToday:'今日',timelineTomorrow:'明日',timelineWeek:'今週',timelineFuture:'未来',timelineUndated:'日付なし',
    timelineTodayCopy:'今日近づいている時刻が {n} 件あります',timelineTomorrowCopy:'明日待っている予定が {n} 件あります',timelineWeekCopy:'今週準備できることが {n} 件あります',timelineFutureCopy:'ゆっくり待ちたい日々です',timelineUndatedCopy:'まだ日付のないアイデアです',
    timelineEmptyToday:'今日は今のところ静かです',timelineEmptyTomorrow:'明日の予定はまだありません',timelineEmptyWeek:'今週残りの記録はありません',timelineEmptyFuture:'未来の日付付き記録はまだありません',timelineEmptyUndated:'日付なしの考えはここに出ます',
    saveCardImage:'カード保存',cardExportDone:'カード画像を生成しました',cardExportUnsupported:'このブラウザでは画像を書き出せません。スクリーンショットで保存できます。',
    spriteName:'時刻アシスタント',spriteOpen:'時刻アシスタントを開く',spriteClose:'時刻アシスタントを閉じる',
    spriteInputAction:'一文を書く',spriteDemoAction:'例を試す',
    spriteEmptyMessage:'一文を渡してください。時刻として整理します。',
    spriteDemoMessage:'何を書くか迷ったら、例でリマインド・記念日・習慣・カレンダー連携を見られます。',
    spriteSoonMessage:'近く {n} 件の時刻があります。',
    spriteTodayMessage:'今日は {n} 件の時刻があります。',
    spriteQuietMessage:'ここで近い時刻をそっと見守ります。',
    spriteTodayLine:'今日 {n} 件',spriteNextLine:'次：{title} · {when}',
    spriteTip1:'一文を時刻に変えるお手伝いができます。',spriteTip2:'今日の予定はまずホームで確認できます。',spriteTip3:'チャットの一段落もまとめて整理できます。',spriteTip4:'大事な記録はバックアップを書き出しましょう。',spriteTip5:'日付付き記録はシステムカレンダーへ書き出せます。',
<<<<<<< HEAD
    navHome:'ホーム',navCal:'カレンダー',navAll:'すべて',navWatch:'ウォッチ',navImport:'整理',navMy:'マイ',
=======
    navHome:'ホーム',navCal:'カレンダー',navAll:'すべて',navImport:'整理',navMy:'マイ',
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    allRecords:'すべての記録',searchRecords:'記録を検索',noSearchResult:'一致する記録がありません',
    all:'すべて',reminder:'リマインド',anniversary:'記念日',habit:'習慣',note:'メモ',
    close:'閉じる',confirm:'OK',details:'詳細',setLarge:'大カード',setNormal:'通常',setBg:'背景',
    setPin:'固定',unpin:'固定解除',theme:'テーマ',setTheme:'テーマ',language:'言語',calendarMode:'暦表示',
    solar:'新暦',lunar:'旧暦',weather:'天気',username:'名前',usernamePh:'お名前を設定',
    personalize:'カスタマイズ',about:'時刻について',enableNotify:'通知を有効化',notifyPerm:'通知権限',
    replayIntro:'オープニング再生',batchImport:'一括整理',importHint:'1行に1件、時間と種類を自動認識。',
    parseImport:'解析',loadExample:'サンプル',uploadTxt:'TXTアップロード',exportData:'エクスポート',
    calendarExport:'カレンダー出力',calendarExportHint:'標準 .ics ファイルを生成し、Google Calendar、Apple Calendar、Outlook にインポートできます。',
    exportIcs:'全カレンダーファイルを書き出す',exportRecordIcs:'カレンダー出力',icsExportDone:'カレンダーファイルを書き出しました',icsExportEmpty:'出力できる日付付き記録がありません',
    icsExportResult:'{n} 件のカレンダー記録を書き出し、日付なし {skipped} 件をスキップしました',
    dataSafety:'データ保護',dataSafetyHint:'時刻のデータはこのブラウザに保存されます。重要な記録は定期的にバックアップしてください。',
    calendarImportGuideTitle:'カレンダーへの取り込み',calendarImportGuide:'これは標準カレンダーファイルの手動インポートです。Google Calendar は設定からインポートとエクスポート、Apple Calendar は .ics を開くかアプリ内で取り込み、Outlook は .ics ファイルを選択します。',
    recordCountLabel:'現在の記録数',exportableCountLabel:'カレンダー出力数',undatedCountLabel:'日付なし記録数',lastBackupLabel:'前回バックアップ',
    neverBackedUp:'未バックアップ',backupSuggested:'記録が増えています。JSON バックアップをおすすめします。',backupLooksOk:'記録はまだ少なめです。必要に応じてバックアップしてください。',
    backupVsCalendarHint:'JSON バックアップは時刻データの復元用、.ics は外部カレンダーへの取り込み用です。用途が異なります。',
    exportJsonBackup:'JSON バックアップ出力',importJsonBackup:'JSON バックアップ取込',storageEngineLabel:'データ保管庫',quarantineCountLabel:'隔離記録',exportQuarantine:'隔離データ出力',indexedDbMode:'IndexedDB メイン',legacyFallbackMode:'ローカルキャッシュ回退',
    reminderNoticeTitle:'リマインド説明',reminderNoticeText:'Web 版のリマインドはブラウザ環境に依存します。ページを閉じた後の長期リマインドは保証されません。時刻をデスクトップに追加し、定期的に開いて確認してください。重要な予定は .ics でシステムカレンダーへ出力することをおすすめします。',
    installPwa:'デスクトップに追加',pwaInstallHint:'ブラウザにインストールボタンが出ない場合は、ブラウザメニューからデスクトップ追加またはアプリのインストールを選んでください。',
    draftExisting:'既存',draftDuplicateSkipped:'重複下書きをスキップしました',batchSaveAll:'すべて保存',
    batchSavedOnly:'{saved} 件を保存しました',batchSavedResult:'{saved} 件を保存し、重複 {skipped} 件をスキップしました',batchSkippedOnly:'新規なし、重複 {skipped} 件をスキップしました',
    exampleRecordsTitle:'サンプル記録',exampleRecordsText:'初回確認用に 5 件のサンプルを作成できます。実データは上書きしません。',
    feedbackTitle:'提案とフィードバック',feedbackText:'問題や提案があればメールで教えてください。',writeEmail:'メール',copyEmail:'コピー',feedbackCopied:'メールをコピーしました',copyFeedbackTemplate:'テンプレートをコピー',feedbackTemplateCopied:'フィードバックテンプレートをコピーしました',feedbackTemplateLabel:'送るときはこの情報が役立ちます：',feedbackTemplateText:'問題：\n利用場面：\nブラウザ/端末：\n改善してほしいこと：',feedbackNoUpload:'ここではフォームのバックエンドに接続せず、ローカルデータもアップロードしません。',copyRecord:'コピー',recordCopied:'記録をコピーしました',moreActions:'その他',
<<<<<<< HEAD
    futurePlanTitle:'今後の予定',futurePlanText:'より能動的な助手機能、豊かなリマインド、日程連携、安定したデータ保護を探ります。',futurePlan1:'より能動的な助手機能。',futurePlan2:'よりよいカレンダー連携。',futurePlan3:'より豊かなリマインド方式。',futurePlan4:'より安全なデータ保護。',futurePlan5:'複数端末体験の探索。',productPositionTitle:'製品の位置づけ',productPositionText:'時刻はカレンダーの代替ではありません。チャット、通知、頭の中の一文を時間感のある記録に整え、カレンダー出力、バックアップ、リマインド説明につなげます。',capabilityChecklistTitle:'製品能力チェックリスト',capabilityChecklistText:'この版はローカル記録、整理、出力、デモ経路に集中しています。',capabilityOneSentence:'一文入力',capabilityLocalSave:'ローカル保存',capabilityJsonBackup:'JSON バックアップ',capabilityIcsExport:'.ics 出力',capabilityBatchOrganize:'一括整理',capabilityDedupe:'重複保護',capabilitySprite:'くま助手',capabilityRecordActions:'記録クイック操作',capabilityUpdateCenter:'更新センター',capabilityWatchCenter:'ウォッチセンター',capabilityFeedback:'フィードバック入口',featureHubTitle:'機能センター',featureHubText:'サンプル、デモ、更新、バックアップ、カレンダー、フィードバックをまとめました。',featureHubDemo:'サンプル',featureHubDemoSub:'5件を作成',featureHubRoute:'デモルート',featureHubRouteSub:'入力から出力へ',featureHubUpdates:'更新',featureHubUpdatesSub:'変更を見る',featureHubSafety:'データ保護',featureHubSafetySub:'JSON バックアップ',featureHubCalendar:'カレンダー出力',featureHubCalendarSub:'.ics 出力',featureHubFeedback:'フィードバック',featureHubFeedbackSub:'メール連絡',featureHubFuture:'今後の予定',featureHubFutureSub:'能力予告',releaseCenterTitle:'更新履歴',releaseCenterText:'最近の版の変更をここにまとめます。初回表示では今回の更新も表示されます。',releaseCenterV140:'ウォッチセンター',releaseCenterV130:'ローカル Agent Core',releaseCenterV120:'ローカル優先データ',releaseCenterV110:'モジュール化構成',releaseCenterV100rc:'正式安定版',releaseCenterV098:'更新センターとフィードバック',releaseCenterV097:'記録カード操作の強化',releaseCenterV096:'ホーム整理と機能センター',releaseCenterV095:'時刻スプライト 2.0',releaseCenterV094:'カスタマイズを前面へ',releaseCenterV093:'製品体験の調整',viewCurrentRelease:'今回の更新を見る',personalizeDesc:'テーマ、言語、時刻スプライトを調整して、あなただけのアシスタントに。',chipTheme:'テーマ',chipLanguage:'言語',chipSprite:'スプライト',chipDisplay:'表示設定',
    releaseTitle:'更新内容',releaseOk:'わかりました',releaseMeta:'現在の版 {version} · {time}',
    releaseNote1:'くまに透明なローカル Agent 入口を追加し、意図、ツール、確認段階を実行前に表示します。',releaseNote2:'検索、今日、画面移動、テーマは直接実行し、作成、固定、出力は確認が必要です。',releaseNote3:'記録削除は必ず二重確認し、ツール引数を検証します。',releaseNote4:'会話はローカル IndexedDB に保存し、ローカル規則の限界を明示します。',releaseNote5:'更新センターに v1.3.0 のローカル Agent Core を記録しました。',
    spriteTodayAction:'今日を見る',spriteBatchAction:'整理する',spriteCalendarAction:'カレンダー',spriteExportAction:'カレンダー出力',spriteBackupAction:'バックアップ',spriteUpdateAction:'更新',spriteResetAction:'位置をリセット',spriteFutureHint:'より能動的な助手機能を計画中です。',
=======
    futurePlanTitle:'今後の予定',futurePlanText:'より能動的な助手機能、豊かなリマインド、日程連携、安定したデータ保護を探ります。',futurePlan1:'より能動的な助手機能。',futurePlan2:'よりよいカレンダー連携。',futurePlan3:'より豊かなリマインド方式。',futurePlan4:'より安全なデータ保護。',futurePlan5:'複数端末体験の探索。',productPositionTitle:'製品の位置づけ',productPositionText:'時刻はカレンダーの代替ではありません。チャット、通知、頭の中の一文を時間感のある記録に整え、カレンダー出力、バックアップ、リマインド説明につなげます。',capabilityChecklistTitle:'製品能力チェックリスト',capabilityChecklistText:'この版はローカル記録、整理、出力、デモ経路に集中しています。',capabilityOneSentence:'一文入力',capabilityLocalSave:'ローカル保存',capabilityJsonBackup:'JSON バックアップ',capabilityIcsExport:'.ics 出力',capabilityBatchOrganize:'一括整理',capabilityDedupe:'重複保護',capabilitySprite:'くま助手',capabilityRecordActions:'記録クイック操作',capabilityUpdateCenter:'更新センター',capabilityFeedback:'フィードバック入口',featureHubTitle:'機能センター',featureHubText:'サンプル、デモ、更新、バックアップ、カレンダー、フィードバックをまとめました。',featureHubDemo:'サンプル',featureHubDemoSub:'5件を作成',featureHubRoute:'デモルート',featureHubRouteSub:'入力から出力へ',featureHubUpdates:'更新',featureHubUpdatesSub:'変更を見る',featureHubSafety:'データ保護',featureHubSafetySub:'JSON バックアップ',featureHubCalendar:'カレンダー出力',featureHubCalendarSub:'.ics 出力',featureHubFeedback:'フィードバック',featureHubFeedbackSub:'メール連絡',featureHubFuture:'今後の予定',featureHubFutureSub:'能力予告',releaseCenterTitle:'更新履歴',releaseCenterText:'最近の版の変更をここにまとめます。初回表示では今回の更新も表示されます。',releaseCenterV141:'確認とオフライン修正',releaseCenterV200rc1:'リリース候補',releaseCenterV200rc2:'プロダクトレスキュー',releaseCenterV140:'ウォッチセンター',releaseCenterV130:'ローカル Agent Core',releaseCenterV120:'ローカル優先データ',releaseCenterV110:'モジュール化構成',releaseCenterV100rc:'正式安定版',releaseCenterV098:'更新センターとフィードバック',releaseCenterV097:'記録カード操作の強化',releaseCenterV096:'ホーム整理と機能センター',releaseCenterV095:'時刻スプライト 2.0',releaseCenterV094:'カスタマイズを前面へ',releaseCenterV093:'製品体験の調整',viewCurrentRelease:'今回の更新を見る',personalizeDesc:'テーマ、言語、時刻スプライトを調整して、あなただけのアシスタントに。',chipTheme:'テーマ',chipLanguage:'言語',chipSprite:'スプライト',chipDisplay:'表示設定',
      releaseTitle:'更新内容',releaseOk:'わかりました',releaseMeta:'現在の版 {version} · {time}',
    releaseNote1:'保存前に項目、日付、時刻、種類を確認できるようになりました。',releaseNote2:'確認カードから変更またはキャンセルでき、事前に書き込みません。',releaseNote3:'送信ロックにより連続確認でも一度だけ保存します。',releaseNote4:'ウォッチセンターの配置と Service Worker キャッシュを修正しました。',releaseNote5:'NLP parser とローカルデータ構造は変更していません。',
    spriteTodayAction:'今日を見る',spriteBatchAction:'整理する',spriteCalendarAction:'カレンダー',spriteExportAction:'カレンダー出力',spriteBackupAction:'バックアップ',spriteUpdateAction:'更新',spriteResetAction:'位置をリセット',spriteFutureHint:'時刻スプライト助手は準備完了です。探索してさらに有効化できます。計画中の機能も設定で利用可能になります。',
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    demoRouteTitle:'一文からカレンダーへ',demoRouteText:'一文を時刻として整理し、いつものカレンダーへ出力します。',
    demoRouteStep1:'一文を入力：明日の午後3時に会議',demoRouteStep2:'記録を作成しカレンダーに表示',demoRouteStep3:'.ics をシステムカレンダーへ出力',demoRouteStep4:'JSON バックアップでデータを保護',
    importPreviewTitle:'インポート確認',sourceTypeLabel:'ファイル種類',sourceNewBackup:'新しい時刻バックアップ',sourceLegacyArray:'旧配列バックアップ',sourceLegacyRecords:'旧 records バックアップ',
    schemaVersionLabel:'schemaVersion',exportedAtLabel:'出力時間',totalImportLabel:'取込予定数',validImportLabel:'有効記録',invalidImportLabel:'無効記録',
    missingIdLabel:'id なし',duplicateIdLabel:'重複 id',conflictIdLabel:'衝突 id',importModeLabel:'取込方式',appendImportMode:'追加取込',
    confirmImport:'取込を確定',cancelImport:'キャンセル',
    importData:'インポート',clearData:'全削除',backup:'バックアップ',
    localDataHint:'データはこのブラウザに保存され、バックアップファイルで移行できます。',
    exportDone:'バックアップを書き出しました',exportFailed:'出力に失敗しました',importDone:'インポートしました',importFailed:'ファイル形式が正しくありません',storageError:'保存容量がいっぱいです',
    importConfirm:'{n}件の記録を既存データに統合してインポートします',
    importConfirmDetail:'{n} 件を追加インポートします。ファイル版：{version}。出力時間：{exportedAt}。ID なし：{missing}、重複 ID：{duplicates}、既存衝突：{conflicts}、無効記録：{invalid}。現在の記録は削除されません。',
    importResult:'インポートしました。追加 {added} 件、無効スキップ {skipped} 件',
    clockFormat:'{year}年{month}月{day}日 {hour}:{min}',
<<<<<<< HEAD
    daysText:'時刻を使い始めて{n}日目',userDaysText:'{name}さん、時刻を使い始めて{n}日目',
    nextReminder:'次の予定',recentRecords:'最近の記録',topCards:'固定',emptyHint:'まだ記録がありません',
=======
    emptyGreeting:'記録は今この瞬間から始まります',daysText:'時刻を使い始めて{n}日目',userDaysText:'{name}さん、時刻を使い始めて{n}日目',
    nextReminder:'次の予定',recentRecords:'最近の記録',topCards:'固定',emptyHint:'まだ記録がありません',trashTitle:'ゴミ箱',trashEmpty:'ゴミ箱は空です',restoreRecord:'復元',permanentlyDelete:'完全に削除',emptyTrash:'ゴミ箱を空にする',snapshotTitle:'スナップショット',createSnapshot:'作成',restoreSnapshot:'復元',deleteSnapshot:'削除',storagePersistence:'ストレージ永続化',requestPersist:'永続化を要求',undoText:'元に戻す',releaseCenterV200rc3:'v2.0.0-rc3 データ安全',
    testNotification:'テスト通知',testDelayedReminder:'1分テスト',exportCalendar:'カレンダー書き出し',
    pushBetaStatus:'プッシュ Beta 状態',pushBetaLocal:'ローカルのみ - クラウドプッシュ未デプロイ',
    reminderAdvice:'ローカルウェブページのみでは、ブラウザ完全終了後の正確なリマインドを保証できません。',
    reminderCheckNote:'ページが開いている時にリマインドをチェックします。ブラウザ終了後のシステムレベルリマインドは今後対応予定です。',
    releaseCenterV200rc4:'v2.0.0-rc5 リマインダー信頼性',
    navSync:'同期',syncTitle:'同期設定',
    syncModeLocal:'ローカルモード：データはこのデバイスのみに保存',syncModeSync:'暗号化同期モード',
    deviceIdentity:'デバイスID',deviceId:'デバイスID',
    syncEndpoint:'同期サーバー',syncLastTime:'前回同期',syncPending:'保留中',
    analyticsConsent:'分析同意',localAnalytics:'ローカル分析',remoteAnalytics:'リモート分析',
    analyticsOff:'オフ',analyticsOn:'オン',
    consentLocal:'ページアクセスと機能使用を記録（ローカルのみ）',
    consentRemote:'匿名使用統計をアップロード（明示的な同意が必要）',
    releaseCenterV200rc5:'v2.0.0-rc5 オプション同期 Beta',
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    today:'今日',tomorrow:'明日',dayAfter:'明後日',minCountdown:'あと{n}分',hourCountdown:'あと{h}時間{m}分',
    dayCountdown:'あと{d}日',tomorrowTime:'明日 {t}',overdueMin:'{n}分経過',overdueHour:'{h}時間経過',
    overdueDay:'{d}日経過',now:'今',pinned:'固定',coverRemove:'画像削除',coverUpload:'画像アップロード',
    presets:'プリセット',coverHint:'大カードは背景変更可',
    weatherUnavail:'天気取得不可',weatherDenied:'位置情報が拒否されました',weatherNoSupport:'このブラウザは位置情報に対応していません',
    weatherHint:'ホームに現在地の天気を表示',wechatVoiceHint:'WeChat内では音声入力に対応していません。テキストをご利用ください',
    notifyUnsupported:'非対応',notifyEnabled:'オン',notifyDenied:'拒否済み',notifyOff:'オフ',
    notifyDeniedToast:'通知権限が拒否されています',notifyOpenPageHint:'ページを開いている間だけリマインドを確認します。ブラウザ終了後の通知は保証されません。',
    notifyDueBody:'リマインドの時間です',
    voiceListening:'聞いています…',voiceProcessing:'認識中…',voiceReady:'マイクをタップして話してください',
    saved:'保存しました',emptyInput:'内容を入力してください',clearConfirm:'すべてのデータを削除しますか？この操作は元に戻せません。',
    storageRecovered:'ローカルデータ異常のため復元用コピーを保存しました',
    deleted:'削除しました',updated:'更新しました',
    holidayNewYear:'元旦',holidaySpring:'春節',holidayLantern:'元宵節',holidayQingming:'清明節',
    holidayLabor:'労働節',holidayDragon:'端午節',holidayMidAutumn:'中秋節',holidayNational:'国慶節',
    holidayValentine:'バレンタイン',holidayWomen:'婦人デー',holidayTree:'植樹節',holidayChildren:'子供の日',
    holidayTeacher:'教師節',holidayChristmas:'クリスマス',
    weekdays:['日','月','火','水','木','金','土'],
    mon_fmt:'{m}月',sun:'日',mon:'月',tue:'火',wed:'水',thu:'木',fri:'金',sat:'土',
    theme_paper:'紙',theme_mono:'墨',theme_coffee:'珈琲',theme_mist:'霧',theme_rose:'薔薇',theme_forest:'森',theme_night:'夜',theme_sakura:'桜',
    cardStyle:'カードスタイル',cardLarge:'大カード',cardNormal:'通常',accentColor:'テーマカラー',
    noRecordsToday:'今日の予定はありません',eventsToday:'今日は{n}件の予定',calQuickAddPh:'この日に記録を追加',
<<<<<<< HEAD
    jan:'1月',feb:'2月',mar:'3月',apr:'4月',may:'5月',jun:'6月',jul:'7月',aug:'8月',sep:'9月',oct:'10月',nov:'11月',dec:'12月'
  }
=======
    jan:'1月',feb:'2月',mar:'3月',apr:'4月',may:'5月',jun:'6月',jul:'7月',aug:'8月',sep:'9月',oct:'10月',nov:'11月',dec:'12月',reminderSettings:'リマインダー設定',reminderSettingsHint:'Web版のリマインドはブラウザ環境に依存します。ページを閉じた後のリマインドは保証されません。重要な予定は .ics でシステムカレンダーに出力することをおすすめします。',defaultLeadTime:'デフォルト通知時間',atEventTime:'開始時',permissionSettings:'権限設定',permissionSettingsHint:'時刻が使用するブラウザ権限を表示・管理',microphonePerm:'マイク',pwaInstallStatus:'PWAインストール',requestMic:'マイク権限を要求',requestStoragePersist:'永続ストレージを要求',dataBackup:'データとバックアップ',storagePersist:'永続ストレージ'}
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
};
var DEMO_ROUTE_I18N={
  'zh-CN':{
    demoRouteEntryTitle:'演示路线',
    demoRouteEntrySub:'从一句话到日历，看看时刻如何整理你的时间。',
    demoRouteExpand:'展开',
    demoRouteCollapse:'收起',
    demoRouteEmptyHint:'也可以先点体验示例。',
    demoRouteOneTitle:'一句话创建',
    demoRouteOneCopy:'把聊天或脑子里的一句话直接写进来。',
    demoRouteOneExample:'明天下午三点开会',
    demoRouteOneAction:'填入示例',
    demoRouteBatchTitle:'批量整理',
    demoRouteBatchCopy:'粘贴一段通知，先生成候选草稿，再勾选保存。',
    demoRouteBatchExample:'明天下午三点开会\n每月15号还信用卡\n7月8日妈妈生日\n每天睡前涂润唇膏',
    demoRouteBatchAction:'打开批量整理',
    demoRouteDedupeTitle:'去重保护',
    demoRouteDedupeCopy:'重复的行、已存在的记录不会反复写入。同一件事只保留一次。',
    demoRouteDedupePoint1:'批量内部重复会去重。',
    demoRouteDedupePoint2:'已存在记录会被识别，避免重复保存。',
    demoRouteCalendarTitle:'接入日历',
    demoRouteCalendarCopy:'带日期的记录可以导出 .ics，导入 Google Calendar、Apple Calendar 或 Outlook。',
    demoRouteCalendarAction:'查看日历导出',
    demoRouteSafetyTitle:'数据安全',
    demoRouteSafetyCopy:'时刻数据保存在当前浏览器。重要记录建议定期导出 JSON 备份。',
    demoRouteSafetyAction:'查看数据安全'
  },
  'zh-TW':{
    demoRouteEntryTitle:'演示路線',
    demoRouteEntrySub:'從一句話到日曆，看看時刻如何整理你的時間。',
    demoRouteExpand:'展開',
    demoRouteCollapse:'收起',
    demoRouteEmptyHint:'也可以先點體驗示例。',
    demoRouteOneTitle:'一句話建立',
    demoRouteOneCopy:'把聊天或腦子裡的一句話直接寫進來。',
    demoRouteOneExample:'明天下午三點開會',
    demoRouteOneAction:'填入示例',
    demoRouteBatchTitle:'批次整理',
    demoRouteBatchCopy:'貼上一段通知，先生成候選草稿，再勾選保存。',
    demoRouteBatchExample:'明天下午三點開會\n每月15號還信用卡\n7月8日媽媽生日\n每天睡前塗潤唇膏',
    demoRouteBatchAction:'打開批次整理',
    demoRouteDedupeTitle:'去重保護',
    demoRouteDedupeCopy:'重複的行、已存在的記錄不會反覆寫入。同一件事只保留一次。',
    demoRouteDedupePoint1:'批次內部重複會去重。',
    demoRouteDedupePoint2:'已存在記錄會被識別，避免重複保存。',
    demoRouteCalendarTitle:'接入日曆',
    demoRouteCalendarCopy:'帶日期的記錄可以匯出 .ics，匯入 Google Calendar、Apple Calendar 或 Outlook。',
    demoRouteCalendarAction:'查看日曆匯出',
    demoRouteSafetyTitle:'資料安全',
    demoRouteSafetyCopy:'時刻資料保存在目前瀏覽器。重要記錄建議定期匯出 JSON 備份。',
    demoRouteSafetyAction:'查看資料安全'
  },
  'en':{
    demoRouteEntryTitle:'Demo route',
    demoRouteEntrySub:'From one sentence to calendar, see how Shike organizes your time.',
    demoRouteExpand:'Expand',
    demoRouteCollapse:'Collapse',
    demoRouteEmptyHint:'You can also try examples first.',
    demoRouteOneTitle:'Create from one sentence',
    demoRouteOneCopy:'Write down one sentence from chat or from your mind.',
    demoRouteOneExample:'明天下午三点开会',
    demoRouteOneAction:'Fill example',
    demoRouteBatchTitle:'Batch organize',
    demoRouteBatchCopy:'Paste a notice, create candidate drafts first, then choose what to save.',
    demoRouteBatchExample:'明天下午三点开会\n每月15号还信用卡\n7月8日妈妈生日\n每天睡前涂润唇膏',
    demoRouteBatchAction:'Open batch organize',
    demoRouteDedupeTitle:'Duplicate protection',
    demoRouteDedupeCopy:'Repeated lines and existing records will not be written again. One thing is kept once.',
    demoRouteDedupePoint1:'Duplicates inside a batch are removed.',
    demoRouteDedupePoint2:'Existing records are detected before saving again.',
    demoRouteCalendarTitle:'Connect to calendar',
    demoRouteCalendarCopy:'Dated records can be exported as .ics for Google Calendar, Apple Calendar, or Outlook import.',
    demoRouteCalendarAction:'View calendar export',
    demoRouteSafetyTitle:'Data safety',
    demoRouteSafetyCopy:'Shike data stays in this browser. Export JSON backups regularly for important records.',
    demoRouteSafetyAction:'View data safety'
  },
  'ja':{
    demoRouteEntryTitle:'デモルート',
    demoRouteEntrySub:'一文からカレンダーへ。時刻が時間を整理する流れを確認できます。',
    demoRouteExpand:'開く',
    demoRouteCollapse:'閉じる',
    demoRouteEmptyHint:'先にサンプルを試すこともできます。',
    demoRouteOneTitle:'一文で作成',
    demoRouteOneCopy:'チャットや頭の中の一文をそのまま書き込みます。',
    demoRouteOneExample:'明天下午三点开会',
    demoRouteOneAction:'サンプルを入力',
    demoRouteBatchTitle:'一括整理',
    demoRouteBatchCopy:'通知文を貼り付け、候補下書きを作ってから選んで保存します。',
    demoRouteBatchExample:'明天下午三点开会\n每月15号还信用卡\n7月8日妈妈生日\n每天睡前涂润唇膏',
    demoRouteBatchAction:'一括整理を開く',
    demoRouteDedupeTitle:'重複保護',
    demoRouteDedupeCopy:'重複行や既存の記録は繰り返し書き込まれません。同じ予定は一度だけ残します。',
    demoRouteDedupePoint1:'一括内の重複は整理されます。',
    demoRouteDedupePoint2:'既存の記録を識別し、重複保存を避けます。',
    demoRouteCalendarTitle:'カレンダーへ',
    demoRouteCalendarCopy:'日付付きの記録は .ics で出力し、Google Calendar、Apple Calendar、Outlook に取り込めます。',
    demoRouteCalendarAction:'カレンダー出力を見る',
    demoRouteSafetyTitle:'データ保護',
    demoRouteSafetyCopy:'時刻のデータはこのブラウザに保存されます。重要な記録は定期的に JSON バックアップしてください。',
    demoRouteSafetyAction:'データ保護を見る'
  }
};
Object.keys(I18N).forEach(function(lang){
  Object.assign(I18N[lang],DEMO_ROUTE_I18N[lang]||DEMO_ROUTE_I18N['zh-CN']);
});
var LANG='zh-CN';
function t(key){var d=I18N[LANG]||I18N['zh-CN'];return d[key]||key;}
function tf(key,vars){var s=t(key);if(vars){for(var k in vars){s=s.replace('{'+k+'}',vars[k]);}}return s;}

/* ========== Settings ========== */
var defaultSettings={
  theme:'paper',language:'zh-CN',calendarMode:'solar',
  weatherEnabled:false,username:'',firstVisitAt:null,
  openingSeen:false,notifyDeniedUntil:0,notifyRequested:false,
  weatherCache:null,weatherCacheAt:0,locationDeniedUntil:0
};
function loadSettings(){
  try{var s=ShikeLegacyStorage.getJson(SETTINGS_KEY,{});return Object.assign({},defaultSettings,s);}
  catch(e){return Object.assign({},defaultSettings);}
}
function saveSettings(s){if(!ShikeLegacyStorage.setJson(SETTINGS_KEY,s))showToast(t('storageError')||'存储失败','error');}
var settings=loadSettings();
LANG=settings.language||'zh-CN';

/* ========== Lunar (2026 map) ========== */
// 2026 lunar: month start days in solar calendar (YYYY-MM-DD) for lunar month 1..12 + leap month
// Simplified: lunar day 1 dates for each lunar month in 2026
var LUNAR_2026={
  months:[
    {solar:'2026-02-17',days:30,name:'正月'},// 正月初一 2/17
    {solar:'2026-03-19',days:29,name:'二月'},// 二月初一 3/19
    {solar:'2026-04-17',days:30,name:'三月'},// 三月初一 4/17
    {solar:'2026-05-17',days:29,name:'四月'},// 四月初一 5/17
    {solar:'2026-06-15',days:30,name:'五月'},// 五月初一 6/15
    {solar:'2026-07-15',days:29,name:'六月'},// 六月初一 7/15
    {solar:'2026-08-13',days:30,name:'七月'},// 七月初一 8/13
    {solar:'2026-09-12',days:29,name:'八月'},// 八月初一 9/12
    {solar:'2026-10-11',days:30,name:'九月'},// 九月初一 10/11
    {solar:'2026-11-10',days:29,name:'十月'},// 十月初一 11/10
    {solar:'2026-12-09',days:30,name:'冬月'},// 冬月初一 12/9
    {solar:'2027-01-08',days:30,name:'腊月'} // 腊月初一 2027/1/8
  ]
};
var LUNAR_DAY_NAMES=['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
function solarToLunar(date){
  var y=date.getFullYear();
  if(y!==2026)return null;// only 2026 supported
  var d=new Date(y,date.getMonth(),date.getDate());
  var dTs=d.getTime();
  var months=LUNAR_2026.months;
  for(var i=months.length-1;i>=0;i--){
    var start=new Date(months[i].solar);
    var startTs=start.getTime();
    if(dTs>=startTs){
      var dayDiff=Math.floor((dTs-startTs)/86400000)+1;
      if(dayDiff<=months[i].days){
        var dayName=LUNAR_DAY_NAMES[dayDiff-1]||(''+dayDiff);
        // First day shows month name
        if(dayDiff===1) return months[i].name;
        if(dayDiff===15) return '十五';
        return dayName;
      }
    }
  }
  // Before 正月初一 2/17 → 腊月 (2025腊月初一 ~ 2026/1/19)
  // Simplified fallback
  return null;
}

/* ========== Holidays (2026) ========== */
var HOLIDAYS_2026={
  '01-01':'holidayNewYear',
  '02-14':'holidayValentine',
  '02-17':'holidaySpring', // 春节初一
  '03-03':'holidayLantern',// 元宵节 (approx 2026: lunar 1/15 = 3/3)
  '03-08':'holidayWomen',
  '03-12':'holidayTree',
  '04-05':'holidayQingming',// 2026清明 approx
  '05-01':'holidayLabor',
  '06-01':'holidayChildren',
  '06-19':'holidayDragon',// 端午初五 approx
  '09-10':'holidayTeacher',
  '09-25':'holidayMidAutumn',// 中秋十五 approx
  '10-01':'holidayNational',
  '12-25':'holidayChristmas'
};
function getHolidayInfo(date){
  if(date.getFullYear()!==2026)return null;
  var key=pad2(date.getMonth()+1)+'-'+pad2(date.getDate());
  var k=HOLIDAYS_2026[key];
  return k?t(k):null;
}

/* ========== Utilities ========== */
function pad2(n){return n<10?'0'+n:''+n;}
function daysInMonthOf(year,monthIndex){return new Date(year,monthIndex+1,0).getDate();}
function escHtml(s){return typeof ShikeSanitize!=='undefined'?ShikeSanitize.escapeHtml(s):String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function escAttr(s){return typeof ShikeSanitize!=='undefined'?ShikeSanitize.escapeAttribute(s):escHtml(String(s||'')).replace(/'/g,'&#39;');}
function $(id){return document.getElementById(id);}
function genId(){return typeof ShikeIds!=='undefined'?ShikeIds.createRecordId():'r_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);}
function showToast(msg,type){
  var c=$('toastContainer');if(!c)return;
  var d=document.createElement('div');d.className='toast'+(type?' '+type:'');d.textContent=msg;
  c.appendChild(d);setTimeout(function(){d.style.opacity='0';d.style.transform='translateY(-8px)';d.style.transition='all .3s';},2200);
  setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},2600);
}
function showConfirm(title,msg,okText,cancelText,onOk,onCancel){
  $('confirmTitle').textContent=title;$('confirmMsg').textContent=msg;
  $('confirmOkBtn').textContent=okText||t('confirm');$('confirmCancelBtn').textContent=cancelText||t('cancel');
  var m=$('confirmMask');m.classList.add('show');
  var box=$('confirmBox');
  function close(){m.classList.remove('show');ok&&(ok.onclick=null);cancel&&(cancel.onclick=null);}
  var ok=$('confirmOkBtn'),cancel=$('confirmCancelBtn');
  ok.onclick=function(){close();onOk&&onOk();};
  cancel.onclick=function(){close();onCancel&&onCancel();};
  m.onclick=function(e){if(e.target===m){close();onCancel&&onCancel();}};
}
function releaseNotesSeen(){
  try{return localStorage.getItem(RELEASE_NOTE_SEEN_KEY)===APP_VERSION;}catch(e){return true;}
}
function markReleaseNotesSeen(){
  try{localStorage.setItem(RELEASE_NOTE_SEEN_KEY,APP_VERSION);}catch(e){}
}
function getReleaseNotes(){
<<<<<<< HEAD
=======
  if(window.ShikeReleaseNotes){var notes=window.ShikeReleaseNotes[LANG]||window.ShikeReleaseNotes['zh-CN'];if(notes)return notes.slice();}
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  return [t('releaseNote1'),t('releaseNote2'),t('releaseNote3'),t('releaseNote4'),t('releaseNote5')];
}
function showReleaseNotes(force){
  if(!force&&releaseNotesSeen())return false;
  var mask=$('releaseMask'),box=$('releaseBox'),list=$('releaseList');
  if(!mask||!box||!list)return false;
  $('releaseTitle').textContent=t('releaseTitle');
  $('releaseMeta').textContent=tf('releaseMeta',{version:APP_VERSION,time:APP_UPDATED_AT});
  list.innerHTML=getReleaseNotes().map(function(item){return '<li>'+escHtml(item)+'</li>';}).join('');
  $('releaseOkBtn').textContent=t('releaseOk');
  mask.classList.add('show');box.classList.add('show');
  return true;
}
function closeReleaseNotes(){
  var mask=$('releaseMask'),box=$('releaseBox');
  if(mask)mask.classList.remove('show');
  if(box)box.classList.remove('show');
  markReleaseNotesSeen();
  setTimeout(function(){window.scrollTo(0,0);},50);
}
function maybeShowReleaseNotes(){
  setTimeout(function(){showReleaseNotes(false);},700);
}
function isWeChat(){return /MicroMessenger/i.test(navigator.userAgent);}

/* ========== Storage ========== */
var records=[];
var RECOVERY_KEY='shike_records_recovery_v1';
var MAX_BACKUP_FILE_SIZE=5*1024*1024;
function backupCorruptedRecords(raw){
  if(!raw)return;
  try{
    localStorage.setItem(RECOVERY_KEY,JSON.stringify({savedAt:Date.now(),raw:String(raw).slice(0,500000)}));
  }catch(e){}
}
function loadRecords(){
  var raw='';
  try{
    if(Array.isArray(window.ShikePreloadedRecords)){
      records=window.ShikePreloadedRecords.map(cloneRecord);
      window.ShikePreloadedRecords=null;
      records.forEach(function(r){migrateRecord(r);});
      ensureUniqueRecordIds(records);
      return;
    }
    raw=ShikeLegacyStorage.getRaw(STORAGE_KEY);
    if(!raw){records=[];return;}
    var parsed=JSON.parse(raw);
    if(!Array.isArray(parsed))throw new Error('records_not_array');
    records=parsed;
    // Migration: add missing fields
    records.forEach(function(r){migrateRecord(r);});
    ensureUniqueRecordIds(records);
  }catch(e){
    backupCorruptedRecords(raw);
    records=[];
    setTimeout(function(){showToast(t('storageRecovered'),'warn');},0);
  }
}
function migrateRecord(r){
  if(!r.id)r.id=genId();
  if(!r.createdAt)r.createdAt=Date.now();
  if(!r.updatedAt)r.updatedAt=r.createdAt;
  if(!r.recordKind)r.recordKind=inferRecordKind(r);
  if(!r.cardStyle)r.cardStyle=(r.recordKind==='anniversary')?'large':'normal';
  if(!r.coverPreset&&r.coverPreset!==0)r.coverPreset=0;
  if(!r.coverImage)r.coverImage=null;
  if(!r.subtitle)r.subtitle='';
  if(typeof r.pinned!=='boolean')r.pinned=false;
  if(!r.accentColor)r.accentColor='';
  if(!r.displayMode)r.displayMode='auto';
  if(!r.repeat)r.repeat='none';
  if(!r.repeatText)r.repeatText='';
  if(typeof r.monthEnd!=='boolean')r.monthEnd=isMonthEndRepeatRecord(r);
  if(!r.dateKey){
    var d=getRecordTargetDateTime(r);
    if(d)r.dateKey=d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
  }
  return r;
}
function saveRecords(){
  try{
    ensureUniqueRecordIds(records);
    if(!ShikeLegacyStorage.setJson(STORAGE_KEY,records))throw new Error('records_write_failed');
    saveLastGoodRecords(records);
<<<<<<< HEAD
    if(window.ShikeLocalFirst)ShikeLocalFirst.persist(records).catch(function(){});
=======
    if(window.ShikeLocalFirst)window.ShikeLocalFirst.persist(records).catch(function(){});
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    return true;
  }
  catch(e){showToast(t('storageError')||'存储空间已满','error');return false;}
}
<<<<<<< HEAD
=======
async function persistRecordsDurably(){
  if(!saveRecords())throw new Error('records_cache_write_failed');
  if(!window.ShikeLocalFirst)return true;
  var result=await window.ShikeLocalFirst.persist(records);
  if(result&&result.fallback)throw new Error('records_indexeddb_write_unavailable');
  return true;
}
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
function saveLastGoodRecords(arr){
  try{
    ShikeLegacyStorage.setJson(LAST_GOOD_RECORDS_KEY,{
      app:'shike',
      appVersion:APP_VERSION,
      schemaVersion:BACKUP_SCHEMA_VERSION,
      savedAt:new Date().toISOString(),
      records:arr||[]
    });
  }catch(e){}
}
function ensureUniqueRecordIds(arr){
  var seen={};
  (arr||[]).forEach(function(r){
    if(!r)return;
    if(!r.id||seen[r.id]){
      var id;
      do{id=genId();}while(seen[id]);
      r.id=id;
    }
    seen[r.id]=true;
  });
  return arr;
}
function cloneRecord(r){
  return JSON.parse(JSON.stringify(r||{}));
}
function buildBackupPayload(){
  var backupRecords=records.map(cloneRecord);
  return {
    app:'shike',
    appVersion:APP_VERSION,
    schemaVersion:BACKUP_SCHEMA_VERSION,
    exportedAt:new Date().toISOString(),
    recordCount:backupRecords.length,
    checksum:ShikeDataIntegrity.checksumRecords(backupRecords),
    records:backupRecords,
    settings:cloneRecord(settings)
  };
}
function countExportableRecords(){
  return records.filter(function(r){return !!(r&&r.dateKey);}).length;
}
function countUndatedRecords(){
  return records.filter(function(r){return !(r&&r.dateKey);}).length;
}
function markBackupExported(){
  try{localStorage.setItem(LAST_BACKUP_KEY,new Date().toISOString());}catch(e){}
}
function getLastBackupText(){
  var raw='';
  try{raw=localStorage.getItem(LAST_BACKUP_KEY)||'';}catch(e){}
  if(!raw)return t('neverBackedUp');
  var d=new Date(raw);
  if(isNaN(d.getTime()))return raw;
  return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())+' '+pad2(d.getHours())+':'+pad2(d.getMinutes());
}
function isValidImportedRecord(r){
  if(!r||typeof r!=='object'||Array.isArray(r))return false;
  return !!String(r.title||r.rawText||r.note||'').trim();
}
function parseBackupPayload(raw){
  var data=JSON.parse(raw);
  var arr=Array.isArray(data)?data:(data&&Array.isArray(data.records)?data.records:null);
  if(!arr)throw new Error('invalid_backup');
  if(data&&data.checksum&&data.checksum!==ShikeDataIntegrity.checksumRecords(arr))throw new Error('backup_checksum_mismatch');
  var sourceType=Array.isArray(data)?'legacyArray':((data&&Array.isArray(data.records)&&data.app==='shike')?'newBackup':'legacyRecords');
  return {
    meta:Array.isArray(data)?{}:data,
    records:arr,
    sourceType:sourceType
  };
}
function prepareBackupImport(parsed){
  var existing={};
  records.forEach(function(r){if(r&&r.id)existing[r.id]=true;});
  var seenInput={},used=Object.assign({},existing);
  var out=[];
<<<<<<< HEAD
=======
  var idMap={};
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  var quarantined=[];
  var summary={
    total:(parsed.records||[]).length,valid:0,invalid:0,missing:0,duplicates:0,conflicts:0,
    sourceType:parsed.sourceType||'legacyRecords',
    schemaVersion:(parsed.meta&&parsed.meta.schemaVersion)||'legacy',
    version:(parsed.meta&&parsed.meta.appVersion)||('schema '+((parsed.meta&&parsed.meta.schemaVersion)||'legacy')),
    exportedAt:(parsed.meta&&parsed.meta.exportedAt)||'unknown'
  };
  (parsed.records||[]).forEach(function(raw,index){
    if(!isValidImportedRecord(raw)){summary.invalid++;quarantined.push({id:'q_import_'+Date.now().toString(36)+'_'+index,reason:'invalid_import_record',raw:raw,quarantinedAt:new Date().toISOString(),schemaVersion:2});return;}
    var r=cloneRecord(raw);
    var originalId=r.id;
    if(!originalId)summary.missing++;
    else if(seenInput[originalId]){summary.duplicates++;r.id='';}
    else if(existing[originalId]){summary.conflicts++;r.id='';}
    if(originalId)seenInput[originalId]=true;
    migrateRecord(r);
    while(!r.id||used[r.id])r.id=genId();
    used[r.id]=true;
<<<<<<< HEAD
    summary.valid++;
    out.push(r);
  });
  return {records:out,quarantined:quarantined,summary:summary};
=======
    if(originalId&&!idMap[originalId])idMap[originalId]=r.id;
    summary.valid++;
    out.push(r);
  });
  return {
    records:out,quarantined:quarantined,summary:summary,idMap:idMap,
    temporal:{temporalGraph:parsed.meta&&parsed.meta.temporalGraph,temporalWaiting:parsed.meta&&parsed.meta.temporalWaiting}
  };
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
}
function sourceTypeLabel(sourceType){
  if(sourceType==='newBackup')return t('sourceNewBackup');
  if(sourceType==='legacyArray')return t('sourceLegacyArray');
  return t('sourceLegacyRecords');
}
function importPreviewRows(summary){
  return [
    [t('sourceTypeLabel'),sourceTypeLabel(summary.sourceType)],
    ['appVersion',summary.version],
    [t('schemaVersionLabel'),summary.schemaVersion],
    [t('exportedAtLabel'),summary.exportedAt],
    [t('totalImportLabel'),summary.total],
    [t('validImportLabel'),summary.valid],
    [t('invalidImportLabel'),summary.invalid],
    [t('missingIdLabel'),summary.missing],
    [t('duplicateIdLabel'),summary.duplicates],
    [t('conflictIdLabel'),summary.conflicts],
    [t('importModeLabel'),t('appendImportMode')]
  ];
}
function buildImportConfirmMessage(summary){
  return tf('importConfirm',{n:summary.valid})+'\n'+tf('importConfirmDetail',{
    n:summary.valid,
    version:summary.version,
    exportedAt:summary.exportedAt,
    missing:summary.missing,
    duplicates:summary.duplicates,
    conflicts:summary.conflicts,
    invalid:summary.invalid
  });
}
var pendingImportPreview=null;
function renderImportPreview(prepared){
  pendingImportPreview=prepared||null;
  var card=$('importPreviewCard');
  if(!card)return;
  if(!prepared){
    card.classList.add('hidden');
    card.innerHTML='';
    return;
  }
  var rows=importPreviewRows(prepared.summary).map(function(row){
    return '<div class="detail-row"><span class="detail-label">'+escHtml(row[0])+'</span><span class="detail-value">'+escHtml(String(row[1]))+'</span></div>';
  }).join('');
  card.classList.remove('hidden');
  card.innerHTML=
    '<div class="draft-item-title">'+escHtml(t('importPreviewTitle'))+'</div>'+
    rows+
    '<div style="display:flex;gap:8px;margin-top:10px;">'+
      '<button class="import-btn" onclick="confirmImportPreview()">'+escHtml(t('confirmImport'))+'</button>'+
      '<button class="import-btn" onclick="cancelImportPreview()">'+escHtml(t('cancelImport'))+'</button>'+
    '</div>';
}
function cancelImportPreview(){
  pendingImportPreview=null;
  renderImportPreview(null);
  var a=$('restoreFileInput');if(a)a.value='';
  var b=$('restoreFileInputMy');if(b)b.value='';
}
function confirmImportPreview(){
  if(!pendingImportPreview)return;
  var prepared=pendingImportPreview;
  pendingImportPreview=null;
  renderImportPreview(null);
  mergePreparedImport(prepared);
  renderMy();
}
function mergePreparedImport(prepared){
  var before=records.map(cloneRecord);
  try{
    records=records.concat(prepared.records);
    ensureUniqueRecordIds(records);
    if(!saveRecords())throw new Error('save_failed');
    if(window.ShikeLocalFirst&&prepared.quarantined&&prepared.quarantined.length)ShikeLocalFirst.quarantine(prepared.quarantined).catch(function(){});
    renderCurrent();
    renderMy();
<<<<<<< HEAD
    showToast(tf('importResult',{added:prepared.records.length,skipped:prepared.summary.invalid}),'success');
=======
    var temporalImport=window.ShikeChronosWeb&&prepared.temporal&&(prepared.temporal.temporalGraph||Array.isArray(prepared.temporal.temporalWaiting));
    if(temporalImport){
      ShikeChronosWeb.importBackupSidecars(prepared).then(function(){
        showToast(tf('importResult',{added:prepared.records.length,skipped:prepared.summary.invalid}),'success');
      }).catch(function(){showToast('记录已导入，但时间图谱未能导入。','warn');});
    }else showToast(tf('importResult',{added:prepared.records.length,skipped:prepared.summary.invalid}),'success');
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    return {added:prepared.records.length,skipped:prepared.summary.invalid};
  }catch(e){
    records=before;
    saveRecords();
    showToast(t('importFailed'),'error');
    return {added:0,skipped:prepared.summary.valid+prepared.summary.invalid,error:e};
  }
}
function exportBackupFile(){
  try{
<<<<<<< HEAD
    var blob=new Blob([JSON.stringify(buildBackupPayload(),null,2)],{type:'application/json'});
=======
    var basePayload=buildBackupPayload();
    var payloadPromise=window.ShikeChronosWeb?ShikeChronosWeb.augmentBackup(basePayload):Promise.resolve(basePayload);
    payloadPromise.then(function(payload){
    var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');a.href=url;a.download='shike-backup-'+ymdForFile(new Date())+'.json';a.click();
    setTimeout(function(){URL.revokeObjectURL(url);},0);
    markBackupExported();
    renderMy();
    showToast(t('exportDone'),'success');
<<<<<<< HEAD
=======
    }).catch(function(){showToast(t('importFailed'),'error');});
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  }catch(e){showToast(t('importFailed'),'error');}
}
function exportQuarantinedData(){
  if(!window.ShikeLocalFirst)return;
  ShikeLocalFirst.getQuarantined().then(function(items){
    var payload={app:'shike',appVersion:APP_VERSION,schemaVersion:2,exportedAt:new Date().toISOString(),recordCount:items.length,records:items};
    downloadTextFile('shike-quarantine-'+ymdForFile(new Date())+'.json',JSON.stringify(payload,null,2),'application/json;charset=utf-8');
  }).catch(function(){showToast(t('exportFailed'),'error');});
}

/* ========== Calendar export (.ics) ========== */
function icsEscapeText(value){
  return String(value||'')
    .replace(/\\/g,'\\\\')
    .replace(/\r\n|\r|\n/g,'\\n')
    .replace(/;/g,'\\;')
    .replace(/,/g,'\\,');
}
function icsFoldLine(line){
  line=String(line||'');
  var out=[];
  while(line.length>73){
    out.push(line.slice(0,73));
    line=' '+line.slice(73);
  }
  out.push(line);
  return out.join('\r\n');
}
function icsUtcStamp(date){
  var d=date instanceof Date?date:new Date(date);
  if(isNaN(d.getTime()))d=new Date();
  return d.getUTCFullYear()+pad2(d.getUTCMonth()+1)+pad2(d.getUTCDate())+'T'+pad2(d.getUTCHours())+pad2(d.getUTCMinutes())+pad2(d.getUTCSeconds())+'Z';
}
function icsDateFromKey(dateKey){
  var m=String(dateKey||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m)return null;
  return new Date(parseInt(m[1],10),parseInt(m[2],10)-1,parseInt(m[3],10));
}
function icsDateOnly(date){
  return date.getFullYear()+pad2(date.getMonth()+1)+pad2(date.getDate());
}
function icsLocalDateTime(date){
  return icsDateOnly(date)+'T'+pad2(date.getHours())+pad2(date.getMinutes())+pad2(date.getSeconds());
}
function icsTimeParts(timeText){
  var m=String(timeText||'').match(/^(\d{1,2}):(\d{2})$/);
  if(!m)return null;
  var h=parseInt(m[1],10),min=parseInt(m[2],10);
  if(h<0||h>23||min<0||min>59)return null;
  return {h:h,m:min};
}
function isMonthEndRepeatRecord(r){
  if(!r||r.repeat!=='monthly')return false;
  if(r.monthEnd===true)return true;
  var text=[r.dateText,r.rawText,r.title].filter(Boolean).join(' ');
  return /每月底|每月末|月底|月末/.test(text);
}
function icsRepeatRuleForRecord(r){
  if(!r)return '';
  if(isMonthEndRepeatRecord(r))return 'FREQ=MONTHLY;BYMONTHDAY=-1';
  if(r.recordKind==='anniversary'||r.repeat==='yearly')return 'FREQ=YEARLY';
  if(r.repeat==='daily')return 'FREQ=DAILY';
  if(r.repeat==='weekly')return 'FREQ=WEEKLY';
  if(r.repeat==='monthly')return 'FREQ=MONTHLY';
  return '';
}
function icsUidForRecord(r){
  var base=String((r&&r.id)||(r&&r.createdAt)||Date.now()).replace(/[^A-Za-z0-9_.-]/g,'');
  return 'shike-'+(base||Date.now())+'@local.shike';
}
function icsDescriptionForRecord(r){
  var lines=['由时刻导出'];
  if(r.rawText&&r.rawText!==r.title)lines.push('原文：'+r.rawText);
  if(r.note)lines.push(r.note);
  return lines.join('\n');
}
function recordToIcsEvent(r){
  if(!r||!r.dateKey)return null;
  var start=icsDateFromKey(r.dateKey);
  if(!start)return null;
  var time=icsTimeParts(r.timeText);
  var allDay=!time||r.recordKind==='anniversary';
  var title=String(r.title||r.rawText||t('appName')).trim();
  var lines=['BEGIN:VEVENT'];
  lines.push('UID:'+icsUidForRecord(r));
  lines.push('DTSTAMP:'+icsUtcStamp(new Date()));
  if(r.createdAt)lines.push('CREATED:'+icsUtcStamp(new Date(r.createdAt)));
  if(r.updatedAt)lines.push('LAST-MODIFIED:'+icsUtcStamp(new Date(r.updatedAt)));
  if(allDay){
    var end=new Date(start);
    end.setDate(end.getDate()+1);
    lines.push('DTSTART;VALUE=DATE:'+icsDateOnly(start));
    lines.push('DTEND;VALUE=DATE:'+icsDateOnly(end));
  }else{
    start.setHours(time.h,time.m,0,0);
    var endTime=new Date(start);
    endTime.setMinutes(endTime.getMinutes()+30);
    lines.push('DTSTART:'+icsLocalDateTime(start));
    lines.push('DTEND:'+icsLocalDateTime(endTime));
  }
  var rule=icsRepeatRuleForRecord(r);
  if(rule)lines.push('RRULE:'+rule);
  lines.push('SUMMARY:'+icsEscapeText(title));
  lines.push('DESCRIPTION:'+icsEscapeText(icsDescriptionForRecord(r)));
  if(r.locationText)lines.push('LOCATION:'+icsEscapeText(r.locationText));
  if(r.recordKind)lines.push('CATEGORIES:'+icsEscapeText(({reminder:t('reminder'),anniversary:t('anniversary'),habit:t('habit'),note:t('note')}[r.recordKind]||r.recordKind)));
  lines.push('STATUS:CONFIRMED');
  lines.push('END:VEVENT');
  return lines;
}
function buildIcsCalendar(sourceRecords){
  var skipped=0;
  var eventGroups=[];
  (sourceRecords||records).forEach(function(r){
    var ev=recordToIcsEvent(r);
    if(ev)eventGroups.push(ev);
    else skipped++;
  });
  var lines=[
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Shike//Time Records//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:'+icsEscapeText(t('appName'))
  ];
  eventGroups.forEach(function(group){lines=lines.concat(group);});
  lines.push('END:VCALENDAR');
  return {text:lines.map(icsFoldLine).join('\r\n')+'\r\n',eventCount:eventGroups.length,skippedCount:skipped};
}
function safeFilePart(value){
  return String(value||'record').replace(/[\\/:*?"<>|]/g,'').replace(/\s+/g,'').slice(0,24)||'record';
}
function ymdForFile(date){
  var d=date||new Date();
  return d.getFullYear()+pad2(d.getMonth()+1)+pad2(d.getDate());
}
function downloadTextFile(filename,content,type){
  var blob=new Blob([content],{type:type||'text/plain;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download=filename;
  a.click();
  setTimeout(function(){URL.revokeObjectURL(url);},0);
}
function drawWrappedText(ctx,text,x,y,maxWidth,lineHeight,maxLines){
  var words=String(text||'').split('');
  var line='',lines=[];
  words.forEach(function(ch){
    var test=line+ch;
    if(ctx.measureText(test).width>maxWidth&&line){
      lines.push(line);line=ch;
    }else line=test;
  });
  if(line)lines.push(line);
  if(maxLines&&lines.length>maxLines){
    lines=lines.slice(0,maxLines);
    lines[lines.length-1]=lines[lines.length-1].replace(/.{1,2}$/,'…');
  }
  lines.forEach(function(l,i){ctx.fillText(l,x,y+i*lineHeight);});
  return y+lines.length*lineHeight;
}
function canvasRoundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}
function exportAnniversaryCardPng(id){
  var r=records.find(function(x){return x.id===id;});
  if(!r||r.recordKind!=='anniversary')return null;
  var canvas=document.createElement('canvas');
  if(!canvas||!canvas.getContext){showToast(t('cardExportUnsupported'),'warn');return null;}
  var ctx=canvas.getContext('2d');
  if(!ctx){showToast(t('cardExportUnsupported'),'warn');return null;}
  var scale=2,w=720,h=960;
  canvas.width=w*scale;canvas.height=h*scale;
  ctx.scale(scale,scale);
  var bodyStyle=getComputedStyle(document.body);
  var bg=(bodyStyle.getPropertyValue('--bg')||'#f7f3ed').trim();
  var elev=(bodyStyle.getPropertyValue('--bg-elev')||'#fdfaf5').trim();
  var ink=(bodyStyle.getPropertyValue('--ink')||'#2c2520').trim();
  var mute=(bodyStyle.getPropertyValue('--ink-mute')||'#8a8178').trim();
  var accent=(bodyStyle.getPropertyValue('--accent')||'#b8553f').trim();
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  var grad=ctx.createLinearGradient(0,0,w,h);
  grad.addColorStop(0,elev);grad.addColorStop(1,bg);
  ctx.fillStyle=grad;canvasRoundRect(ctx,52,60,w-104,h-120,28);ctx.fill();
  ctx.strokeStyle='rgba(44,37,32,.10)';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=accent;ctx.globalAlpha=.10;ctx.beginPath();ctx.arc(w-120,140,92,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle=accent;ctx.font='24px serif';ctx.fillText(t('anniversary'),92,130);
  ctx.fillStyle=ink;ctx.font='bold 52px serif';
  var nextY=drawWrappedText(ctx,r.title||t('appName'),92,235,w-184,64,2);
  var d=getNextVisibleDate(r);
  var dateText=d?(d.getFullYear()+'.'+pad2(d.getMonth()+1)+'.'+pad2(d.getDate())):(r.dateText||'');
  ctx.fillStyle=mute;ctx.font='24px sans-serif';ctx.fillText(dateText,92,nextY+28);
  var cd=formatLiveCountdown(r);
  ctx.fillStyle=accent;ctx.font='bold 56px serif';
  drawWrappedText(ctx,cd?cd.text:'',92,nextY+112,w-184,64,2);
  if(r.subtitle||r.note){
    ctx.fillStyle=mute;ctx.font='24px sans-serif';
    drawWrappedText(ctx,r.subtitle||r.note,92,650,w-184,34,3);
  }
  ctx.fillStyle=ink;ctx.font='bold 26px serif';ctx.fillText(t('appName'),92,830);
  ctx.fillStyle=mute;ctx.font='18px sans-serif';ctx.fillText('shike.app · '+new Date().toLocaleDateString(),92,862);
  function saveBlob(blob){
    if(!blob){showToast(t('cardExportUnsupported'),'warn');return;}
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;
    a.download='shike-card-'+safeFilePart(r.title)+'.png';
    a.click();
    setTimeout(function(){URL.revokeObjectURL(url);},0);
    showToast(t('cardExportDone'),'success');
  }
  if(canvas.toBlob)canvas.toBlob(saveBlob,'image/png');
  else{
    try{
      var data=canvas.toDataURL('image/png');
      var bin=atob(data.split(',')[1]);
      var arr=new Uint8Array(bin.length);
      for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
      saveBlob(new Blob([arr],{type:'image/png'}));
    }catch(e){showToast(t('cardExportUnsupported'),'warn');}
  }
  return canvas;
}
function exportIcsFile(){
  try{
    var cal=buildIcsCalendar(records);
    if(!cal.eventCount){showToast(t('icsExportEmpty'),'warn');return cal;}
    downloadTextFile('shike-calendar-'+ymdForFile(new Date())+'.ics',cal.text,'text/calendar;charset=utf-8');
    showToast(tf('icsExportResult',{n:cal.eventCount,skipped:cal.skippedCount}),'success');
    return cal;
  }catch(e){showToast(t('importFailed'),'error');return null;}
}
function exportRecordIcsFile(id){
  var r=records.find(function(x){return x.id===id;});
  if(!r){showToast(t('icsExportEmpty'),'warn');return null;}
  var cal=buildIcsCalendar([r]);
  if(!cal.eventCount){showToast(t('icsExportEmpty'),'warn');return cal;}
  downloadTextFile('shike-record-'+safeFilePart(r.title)+'.ics',cal.text,'text/calendar;charset=utf-8');
  showToast(t('icsExportDone'),'success');
  return cal;
}
function recordTextForCopy(r){
  if(!r)return '';
  var parts=[r.title||r.rawText||''];
  var meta=[];
  if(r.dateText)meta.push(r.dateText);
  if(r.timeText)meta.push(r.timeText);
  if(r.repeat&&r.repeat!=='none')meta.push(repeatLabel(r.repeat));
  if(meta.length)parts.push(meta.join(' · '));
  if(r.note||r.subtitle)parts.push(r.note||r.subtitle);
  return parts.filter(Boolean).join('\n');
}
function copyRecordText(id){
  var r=records.find(function(x){return x.id===id;});
  if(!r)return;
  var text=recordTextForCopy(r);
  function done(){showToast(t('recordCopied'),'success');closeSwipeCards(null);}
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done).catch(function(){fallbackCopyRecordText(text);done();});
  }else{
    fallbackCopyRecordText(text);done();
  }
}
function fallbackCopyRecordText(text){
  var ta=document.createElement('textarea');
  ta.value=text;ta.setAttribute('readonly','');
  ta.style.position='fixed';ta.style.left='-9999px';
  document.body.appendChild(ta);ta.select();
  try{document.execCommand&&document.execCommand('copy');}catch(e){}
  document.body.removeChild(ta);
}

/* ========== Demo records ========== */
function demoDateKey(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
function demoDateText(d){
  var now=new Date();
  var md=(d.getMonth()+1)+'月'+d.getDate()+'日';
  return d.getFullYear()===now.getFullYear()?md:(d.getFullYear()+'年'+md);
}
function getNextDemoBirthdayDate(){
  var now=new Date();
  var d=new Date(now.getFullYear(),6,8);
  if(setHoursZero(d).getTime()<setHoursZero(now).getTime())d.setFullYear(now.getFullYear()+1);
  return d;
}
function getMonthEndDate(){
  var now=new Date();
  return new Date(now.getFullYear(),now.getMonth()+1,0);
}
function buildDemoRecordTemplates(){
  var now=new Date();
  var today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  var tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);
  var birthday=getNextDemoBirthdayDate();
  var monthEnd=getMonthEndDate();
  var base=Date.now();
  return [
    {demoKey:'v074_mom_birthday',title:'妈妈生日',dateText:demoDateText(birthday),dateKey:demoDateKey(birthday),timeText:'',note:'记得提前准备礼物',repeat:'yearly',rawText:'妈妈生日',recordKind:'anniversary',coverPreset:0,subtitle:'记得提前准备礼物',pinned:true,cardStyle:'large'},
    {demoKey:'v074_meeting',title:'开会',dateText:'明天',dateKey:demoDateKey(tomorrow),timeText:'15:00',note:'',repeat:'none',rawText:'明天下午三点开会',recordKind:'reminder',coverPreset:1,subtitle:'',pinned:false,cardStyle:'normal'},
    {demoKey:'v074_lip_balm',title:'涂润唇膏',dateText:'每天',dateKey:demoDateKey(today),timeText:'22:30',note:'',repeat:'daily',rawText:'每天睡前涂润唇膏',recordKind:'habit',coverPreset:3,subtitle:'',pinned:false,cardStyle:'normal'},
    {demoKey:'v074_credit_card',title:'还信用卡',dateText:'月底',dateKey:demoDateKey(monthEnd),timeText:'',note:'',repeat:'monthly',rawText:'月底还信用卡',recordKind:'reminder',monthEnd:true,coverPreset:4,subtitle:'',pinned:false,cardStyle:'normal'},
    {demoKey:'v074_travel_list',title:'旅行清单',dateText:'',dateKey:'',timeText:'',note:'身份证、充电器、换洗衣物、雨伞',repeat:'none',rawText:'旅行清单',recordKind:'note',coverPreset:2,subtitle:'身份证、充电器、换洗衣物、雨伞',pinned:false,cardStyle:'normal'}
  ].map(function(tpl,i){
    return normalizeRecord({
      id:'demo_'+tpl.demoKey+'_'+base,
      demoKey:tpl.demoKey,
      title:tpl.title,dateText:tpl.dateText,dateKey:tpl.dateKey,timeText:tpl.timeText,note:tpl.note,
      repeat:tpl.repeat,repeatText:repeatLabel(tpl.repeat),rawText:tpl.rawText,
      monthEnd:!!tpl.monthEnd,
      archived:false,createdAt:base-i*1000,updatedAt:base-i*1000,ts:base-i*1000,
      recordKind:tpl.recordKind,recordState:'active',notifyMode:'none',notifiedAt:null,
      coverImage:null,coverPreset:tpl.coverPreset,subtitle:tpl.subtitle,pinned:tpl.pinned,
      cardStyle:tpl.cardStyle,accentColor:'',displayMode:'auto'
    });
  });
}
function hasDemoRecords(){
  try{if(localStorage.getItem(DEMO_FLAG_KEY)==='true')return true;}catch(e){}
  return records.some(function(r){return r.demoKey&&String(r.demoKey).indexOf('v074_')===0;});
}
function demoRecordExists(tpl){
  return records.some(function(r){
    if(r.demoKey===tpl.demoKey)return true;
    return r.recordKind===tpl.recordKind&&r.title===tpl.title&&(!tpl.rawText||r.rawText===tpl.rawText);
  });
}
function refreshAfterDemoImport(){
  updateLayoutState();
  renderHome();
  renderAll();
  renderCalendar();
  renderMy();
  renderTimeSprite();
  startCountdownTicker();
}
function addDemoRecords(){
  if(hasDemoRecords()){showToast(t('demoAlready'),'warn');return;}
  var templates=buildDemoRecordTemplates();
  var toAdd=templates.filter(function(tpl){return !demoRecordExists(tpl);});
  if(toAdd.length===0){
    try{localStorage.setItem(DEMO_FLAG_KEY,'true');}catch(e){}
    showToast(t('demoAlready'),'warn');return;
  }
  records=toAdd.concat(records);
  saveRecords();
  try{localStorage.setItem(DEMO_FLAG_KEY,'true');}catch(e){}
  refreshAfterDemoImport();
  showToast(tf('demoAdded',{n:toAdd.length}),'success');
}

/* ========== Time Sprite ========== */
var timeSpriteCollapsed=true;
var timeSpriteDragState=null;
var timeSpriteSuppressClick=false;
var timeSpriteManualTip='';
function readTimeSpriteCollapsed(){
  try{
    var saved=localStorage.getItem(SPRITE_COLLAPSED_KEY);
    if(saved===null)saved=localStorage.getItem(ASSISTANT_COLLAPSED_KEY);
    if(saved==='true')return true;
    if(saved==='false')return false;
  }catch(e){}
  return !!(window.matchMedia&&window.matchMedia('(max-width: 767px)').matches);
}
function saveTimeSpriteCollapsed(value){
  timeSpriteCollapsed=!!value;
  try{
    localStorage.setItem(SPRITE_COLLAPSED_KEY,timeSpriteCollapsed?'true':'false');
    localStorage.setItem(ASSISTANT_COLLAPSED_KEY,timeSpriteCollapsed?'true':'false');
  }catch(e){}
  renderTimeSprite();
}
function getTimeSpriteTips(){
  return [t('spriteTip1'),t('spriteTip2'),t('spriteTip3'),t('spriteTip4'),t('spriteTip5')].filter(Boolean);
}
function showTimeSpriteGreeting(){
  var tips=getTimeSpriteTips();
  if(!tips.length)return;
  var index=0;
  try{
    var saved=parseInt(localStorage.getItem(SPRITE_LAST_TIP_KEY)||'0',10);
    index=isNaN(saved)?0:(saved+1)%tips.length;
    localStorage.setItem(SPRITE_LAST_TIP_KEY,String(index));
  }catch(e){}
  timeSpriteManualTip=tips[index];
  var message=$('timeSpriteMessage');if(message)message.textContent=timeSpriteManualTip;
}
function readTimeSpritePosition(){
  try{
    var raw=localStorage.getItem(SPRITE_POS_KEY);
    if(!raw)return null;
    var pos=JSON.parse(raw);
    if(typeof pos.left==='number'&&typeof pos.top==='number')return pos;
  }catch(e){}
  return null;
}
function clampTimeSpritePosition(left,top){
  var root=$('timeSprite');
  var w=root&&root.offsetWidth?root.offsetWidth:320;
  var h=root&&root.offsetHeight?root.offsetHeight:80;
  var margin=10;
  var maxLeft=Math.max(margin,window.innerWidth-w-margin);
  var safeBottom=0;
  if(typeof getComputedStyle==='function')safeBottom=varNumber(getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom'));
  var maxTop=Math.max(margin,window.innerHeight-h-margin-safeBottom);
  return {left:Math.min(Math.max(margin,left),maxLeft),top:Math.min(Math.max(margin,top),maxTop)};
}
function varNumber(value){
  var n=parseFloat(value);
  return isNaN(n)?0:n;
}
function applyTimeSpritePosition(pos){
  var root=$('timeSprite');if(!root)return;
  if(!pos){
    root.style.left='';
    root.style.top='';
    root.style.right='';
    root.style.bottom='';
    return;
  }
  var safe=clampTimeSpritePosition(pos.left,pos.top);
  root.style.left=safe.left+'px';
  root.style.top=safe.top+'px';
  root.style.right='auto';
  root.style.bottom='auto';
}
function saveTimeSpritePosition(pos){
  var safe=clampTimeSpritePosition(pos.left,pos.top);
  try{localStorage.setItem(SPRITE_POS_KEY,JSON.stringify(safe));}catch(e){}
  applyTimeSpritePosition(safe);
}
function resetTimeSpritePosition(){
  try{localStorage.removeItem(SPRITE_POS_KEY);}catch(e){}
  applyTimeSpritePosition(null);
  showToast(t('updated'),'success');
}
function getTimeSpriteRecordDate(r){
  return getRecordTargetDateTime(r,{allowPast:r&&r.recordKind==='anniversary'});
}
function getTimeSpriteUpcomingItems(){
  var nowTs=new Date().getTime();
  return records.map(function(r){
    var d=getTimeSpriteRecordDate(r);
    return d?{record:r,date:d,time:d.getTime()}:null;
  }).filter(function(item){return item&&item.time>=nowTs-60000;})
    .sort(function(a,b){return a.time-b.time;});
}
function getTimeSpriteTodayCount(){
  var today=setHoursZero(new Date()).getTime();
  return records.filter(function(r){
    var d=getTimeSpriteRecordDate(r);
    return d&&setHoursZero(d).getTime()===today;
  }).length;
}
function formatTimeSpriteWhen(item){
  if(!item||!item.date)return '';
  var when=dateTextFromDate(item.date);
  if(item.record&&item.record.timeText)when+=' '+item.record.timeText;
  return when;
}
function renderTimeSprite(){
  var root=$('timeSprite');if(!root)return;
  var expanded=!timeSpriteCollapsed;
  root.classList.toggle('collapsed',!expanded);
  var toggle=$('timeSpriteToggle');
  if(toggle){
    if(toggle.setAttribute){
      toggle.setAttribute('aria-expanded',expanded?'true':'false');
      toggle.setAttribute('aria-label',expanded?t('spriteClose'):t('spriteOpen'));
    }
  }
  var close=$('timeSpriteClose');if(close&&close.setAttribute)close.setAttribute('aria-label',t('spriteClose'));
  var title=$('timeSpriteTitle');if(title)title.textContent=t('spriteName');
  var inputBtn=$('timeSpriteInputBtn');if(inputBtn)inputBtn.textContent=t('spriteInputAction');
  var todayBtn=$('timeSpriteTodayBtn');if(todayBtn)todayBtn.textContent=t('spriteTodayAction');
  var batchBtn=$('timeSpriteBatchBtn');if(batchBtn)batchBtn.textContent=t('spriteBatchAction');
  var calBtn=$('timeSpriteCalendarBtn');if(calBtn)calBtn.textContent=t('spriteCalendarAction');
  var backupBtn=$('timeSpriteBackupBtn');if(backupBtn)backupBtn.textContent=t('spriteBackupAction');
  var updateBtn=$('timeSpriteUpdateBtn');if(updateBtn)updateBtn.textContent=t('spriteUpdateAction');
  var exportBtn=$('timeSpriteExportBtn');if(exportBtn)exportBtn.textContent=t('spriteExportAction');
  var resetBtn=$('timeSpriteResetBtn');if(resetBtn)resetBtn.textContent=t('spriteResetAction');
  var future=$('timeSpriteFuture');if(future)future.textContent=t('spriteFutureHint');
  var demoBtn=$('timeSpriteDemoBtn');
  if(demoBtn)demoBtn.textContent=t('spriteDemoAction');
  var items=getTimeSpriteUpcomingItems();
  var nowTs=Date.now();
  var soon=items.filter(function(item){return item.time>=nowTs&&item.time<=nowTs+3*86400000;}).length;
  var todayCount=getTimeSpriteTodayCount();
  var msg=t('spriteQuietMessage');
  if(!hasAnyRecord())msg=t('spriteEmptyMessage');
  else if(soon>0)msg=tf('spriteSoonMessage',{n:soon});
  else if(todayCount>0)msg=tf('spriteTodayMessage',{n:todayCount});
  else if(!hasDemoRecords()&&records.length<2)msg=t('spriteDemoMessage');
  var message=$('timeSpriteMessage');if(message)message.textContent=timeSpriteManualTip||msg;
  var metaParts=[];
  if(todayCount>0)metaParts.push(tf('spriteTodayLine',{n:todayCount}));
  if(items[0])metaParts.push(tf('spriteNextLine',{title:items[0].record.title||t('appName'),when:formatTimeSpriteWhen(items[0])}));
  var meta=$('timeSpriteMeta');if(meta)meta.textContent=metaParts.join(' · ');
}
function initTimeSprite(){
  timeSpriteCollapsed=readTimeSpriteCollapsed();
  applyTimeSpritePosition(readTimeSpritePosition());
  initTimeSpriteDrag();
  b('timeSpriteToggle','click',function(){
    if(timeSpriteSuppressClick){timeSpriteSuppressClick=false;return;}
    saveTimeSpriteCollapsed(!timeSpriteCollapsed);
    if(!timeSpriteCollapsed)showTimeSpriteGreeting();
  });
  b('timeSpriteClose','click',function(){saveTimeSpriteCollapsed(true);});
  b('timeSpriteInputBtn','click',function(){
    saveTimeSpriteCollapsed(true);
    switchPage('home');
    setTimeout(function(){var inp=$('quickInput');if(inp)inp.focus();},60);
  });
  b('timeSpriteDemoBtn','click',function(){
    jumpToMySection('experienceExampleSection');
    saveTimeSpriteCollapsed(true);
  });
  b('timeSpriteTodayBtn','click',function(){switchPage('home');saveTimeSpriteCollapsed(true);});
  b('timeSpriteBatchBtn','click',function(){switchPage('import');var input=$('importTextInput');if(input)setTimeout(function(){input.focus();},60);saveTimeSpriteCollapsed(true);});
  b('timeSpriteCalendarBtn','click',function(){switchPage('calendar');saveTimeSpriteCollapsed(true);});
  b('timeSpriteExportBtn','click',function(){jumpToMySection('calendarExportSection');saveTimeSpriteCollapsed(true);});
<<<<<<< HEAD
  b('timeSpriteBackupBtn','click',function(){jumpToMySection('dataSafetySection');saveTimeSpriteCollapsed(true);});
=======
  b('timeSpriteBackupBtn','click',function(){jumpToMySection('dataBackupSection');saveTimeSpriteCollapsed(true);});
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  b('timeSpriteUpdateBtn','click',function(){showReleaseNotes(true);saveTimeSpriteCollapsed(false);});
  b('timeSpriteResetBtn','click',resetTimeSpritePosition);
  renderTimeSprite();
}
function initTimeSpriteDrag(){
  var toggle=$('timeSpriteToggle'),root=$('timeSprite');
  if(!toggle||!root||!toggle.addEventListener)return;
  toggle.addEventListener('pointerdown',function(e){
    if(e.button!==undefined&&e.button!==0)return;
    var rect=root.getBoundingClientRect();
    timeSpriteDragState={id:e.pointerId,startX:e.clientX,startY:e.clientY,left:rect.left,top:rect.top,moved:false};
    if(toggle.setPointerCapture)try{toggle.setPointerCapture(e.pointerId);}catch(err){}
  });
  toggle.addEventListener('pointermove',function(e){
    if(!timeSpriteDragState||timeSpriteDragState.id!==e.pointerId)return;
    var dx=e.clientX-timeSpriteDragState.startX;
    var dy=e.clientY-timeSpriteDragState.startY;
    if(Math.abs(dx)+Math.abs(dy)>4)timeSpriteDragState.moved=true;
    if(!timeSpriteDragState.moved)return;
    root.classList.add('dragging');
    applyTimeSpritePosition({left:timeSpriteDragState.left+dx,top:timeSpriteDragState.top+dy});
    e.preventDefault();
  });
  function endDrag(e){
    if(!timeSpriteDragState||timeSpriteDragState.id!==e.pointerId)return;
    root.classList.remove('dragging');
    if(timeSpriteDragState.moved){
      var rect=root.getBoundingClientRect();
      saveTimeSpritePosition({left:rect.left,top:rect.top});
      timeSpriteSuppressClick=true;
    }
    timeSpriteDragState=null;
  }
  toggle.addEventListener('pointerup',endDrag);
  toggle.addEventListener('pointercancel',endDrag);
  window.addEventListener('resize',function(){applyTimeSpritePosition(readTimeSpritePosition());});
}

/* ========== NLP Parser ========== */
var CN_NUM={零:0,〇:0,一:1,二:2,两:2,三:3,四:4,五:5,六:6,七:7,八:8,九:9,十:10};
function cnNumToInt(s){
  if(/^\d+$/.test(s))return parseInt(s,10);
  if(s==='半')return 30;
  if(s.length===1&&CN_NUM[s]!==undefined)return CN_NUM[s];
  // Handle 十X (十二=12), X十(二十=20), X十Y (二十三=23)
  if(s.indexOf('十')>=0){
    var parts=s.split('十');
    var tens=parts[0]===''?1:(CN_NUM[parts[0]]||parseInt(parts[0],10)||0);
    var ones=parts[1]===''?0:(CN_NUM[parts[1]]||parseInt(parts[1],10)||0);
    return tens*10+ones;
  }
  return null;
}

var HOLIDAY_WORDS=['生日','纪念日','周年','祭日','逝世纪念'];
var ANNIV_WORDS=['生日','纪念日','周年','祭日','节日'];
var HABIT_WORDS=['每天','每日','每周','每月','每年','天天','每个星期'];
var REMINDER_WORDS=['开会','吃饭','睡觉','起床','上课','交','体检','还','吃药','喝水','跑步','出门','拿快递','看电影','复习','考试','交作业','接孩子','面试','旅行','交报告','抢票','交房租','涂润唇膏','健身','买'];

function inferRecordKindFromText(text){
  for(var i=0;i<ANNIV_WORDS.length;i++){if(text.indexOf(ANNIV_WORDS[i])>=0)return'anniversary';}
  if(/每年/.test(text))return'anniversary';
  if(/每天|每日|每周|每月|天天/.test(text))return'habit';
  return'reminder';
}

function parseReminderText(rawText){
  if(!rawText)return null;
  var text=rawText.trim();
  var result={title:'',dateText:'',dateKey:'',timeText:'',recordKind:'reminder',repeat:'none',repeatText:'',rawText:rawText,relativeMinutes:null,monthEnd:false};

  // === 1. Repeat detection ===
  if(/每天|每日|天天/.test(text)){result.repeat='daily';result.repeatText=t('reminder');/*fallback*/}
  else if(/每周[一二三四五六日天]?|每个星期/.test(text)){result.repeat='weekly';}
  else if(/每月底|每月末|每月\d{1,2}[日号]?|每个月/.test(text)){result.repeat='monthly';}
  else if(/每年/.test(text)){result.repeat='yearly';result.recordKind='anniversary';}

  // Extract day-of-week for weekly
  var wkMatch=text.match(/每周([一二三四五六日天])/);
  if(wkMatch)result.weekday=wkMatch[1];
  // Extract day-of-month for monthly
  var moMatch=text.match(/每月(\d{1,2})[日号]?/);
  if(moMatch)result.monthDay=parseInt(moMatch[1],10);
  if(/每月底|每月末/.test(text))result.monthEnd=true;

  // === 2. Relative time ===
  var now=new Date();
  var relMin=null;
  if(/马上|立刻|即刻/.test(text))relMin=10;
  else if(/稍后|稍等|过会儿|过一会/.test(text))relMin=60;
  else if(/待会|等一下|等会|一会儿|一会|等一等/.test(text))relMin=30;
  else{
    var mh=text.match(/(\d+|[一二两三四五六七八九十]+)\s*(?:个)?\s*(?:小时|钟头|h)/);
    var mm=text.match(/(\d+|[一二两三四五六七八九十]+|半)\s*(?:分钟|分|m)\s*后/);
    if(mh){var hn=cnNumToInt(mh[1]);if(hn)relMin=hn*60;}
    else if(mm){
      var mn;
      if(mm[1]==='半')mn=30;else mn=cnNumToInt(mm[1]);
      if(mn)relMin=mn;
    }
    else if(/半小时后/.test(text))relMin=30;
  }
  if(relMin!==null){
    var tDate=new Date(now.getTime()+relMin*60000);
    result.dateText='今天';
    result.timeText=pad2(tDate.getHours())+':'+pad2(tDate.getMinutes());
    result.relativeMinutes=relMin;
  }

  // === 3. Date detection ===
  var today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  var targetDate=null;
  if(!relMin){
    if(/大后天/.test(text)){targetDate=new Date(today);targetDate.setDate(today.getDate()+3);result.dateText='大后天';}
    else if(/后天/.test(text)){targetDate=new Date(today);targetDate.setDate(today.getDate()+2);result.dateText='后天';}
    else if(/明天/.test(text)){targetDate=new Date(today);targetDate.setDate(today.getDate()+1);result.dateText='明天';}
    else if(/今天/.test(text)){targetDate=new Date(today);result.dateText='今天';}
    else if(/昨天/.test(text)){targetDate=new Date(today);targetDate.setDate(today.getDate()-1);result.dateText='昨天';}
    else{
      // Weekdays
      var wkMap={'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'日':0,'天':0};
      var wkMatch2=text.match(/每?(下下|下|这|本)?(周|星期)([一二三四五六日天])/);
      if(wkMatch2){
        var prefix=wkMatch2[1]||'这';
        var wd=wkMap[wkMatch2[3]];
        var curWd=today.getDay();
        var diff=wd-curWd;
        if(prefix==='下'){diff+=7;if(diff<=0)diff+=7;}
        else if(prefix==='这'||prefix==='本'){if(diff<=0)diff+=7;}
        targetDate=new Date(today);targetDate.setDate(today.getDate()+diff);
        var wkNames=[t('sun'),t('mon'),t('tue'),t('wed'),t('thu'),t('fri'),t('sat')];
        result.dateText=(prefix==='下'?'下':'')+wkNames[wd];
      }else{
        // Exact date: 7月8日, 2026年7月8日, 7/8
        var dm=text.match(/(?:(\d{4})\s*年)?\s*(\d{1,2})\s*[月/\-]\s*(\d{1,2})\s*[日号]?/);
        if(dm){
          var y=dm[1]?parseInt(dm[1],10):now.getFullYear();
          var m=parseInt(dm[2],10)-1;
          var d=parseInt(dm[3],10);
          targetDate=new Date(y,m,d);
          result.dateText=(dm[1]?y+'年':'')+(m+1)+'月'+d+'日';
          if(result.repeat==='none'){
            // If year is explicit, still yearly when anniversary words present; otherwise none
            if(dm[1]){
              if(/生日|纪念日|周年|祭日/.test(text))result.repeat='yearly';
              else result.repeat='none';
            }else{result.repeat='yearly';}
          }
          if(result.repeat==='yearly')result.recordKind='anniversary';
        }else{
          // Month-end / next month
          if(result.repeat==='monthly'&&result.monthEnd){
            targetDate=new Date(today.getFullYear(),today.getMonth()+1,0);
            result.dateText='月底';
          }else if(result.repeat==='monthly'&&result.monthDay){
            var md=Math.min(result.monthDay,daysInMonthOf(today.getFullYear(),today.getMonth()));
            targetDate=new Date(today.getFullYear(),today.getMonth(),md);
            if(targetDate.getTime()<today.getTime()){
              var nextMonth=today.getMonth()+1;
              md=Math.min(result.monthDay,daysInMonthOf(today.getFullYear(),nextMonth));
              targetDate=new Date(today.getFullYear(),nextMonth,md);
            }
            result.dateText=(targetDate.getMonth()+1)+'月'+targetDate.getDate()+'日';
          }else if(/月底|月末/.test(text)){
            targetDate=new Date(today.getFullYear(),today.getMonth()+1,0);
            result.dateText='月底';
          }else if(/下个月|下月/.test(text)){
            targetDate=new Date(today.getFullYear(),today.getMonth()+1,1);
            result.dateText='下个月';
          }else if(/一周后|1周后|一个星期后/.test(text)){
            targetDate=new Date(today);targetDate.setDate(today.getDate()+7);
            result.dateText='一周后';
          }else{
            var dayMatch=text.match(/(\d+|[一二两三四五六七八九十]+)\s*天后?/);
            if(dayMatch){
              var dn=cnNumToInt(dayMatch[1]);
              if(dn&&dn<365){
                targetDate=new Date(today);targetDate.setDate(today.getDate()+dn);
                result.dateText=dn+'天后';
              }
            }
          }
        }
      }
    }
  }

  // === 4. Time detection ===
  var hour=null,minute=null,period=null;
  // Period words
  if(/凌晨|清晨/.test(text))period='wee';
  else if(/早上|早晨|上午/.test(text))period='am';
  else if(/中午|正午/.test(text))period='noon';
  else if(/下午/.test(text))period='pm';
  else if(/晚上|夜里|夜晚|晚间|今晚|晚/.test(text))period='pm';
  // 今晚 → today if no date
  if(/今晚/.test(text)&&!targetDate){targetDate=new Date(today);result.dateText='今天';}

  // Clock patterns:
  // HH:MM
  var hmMatch=text.match(/(\d{1,2}):(\d{2})/);
  if(hmMatch){hour=parseInt(hmMatch[1],10);minute=parseInt(hmMatch[2],10);}
  else{
    // X点 / X点钟 / X点半 / X点一刻 / X点三刻 / X点Y分 / X点YY
    var clockRe=/([零〇一二两三四五六七八九十\d]{1,3})\s*点\s*(钟|半|一刻|三刻|(?:[零〇一二三四五六七八九十\d]{1,3})\s*分?)?/;
    var cm=text.match(clockRe);
    if(cm){
      var hRaw=cm[1];
      hour=cnNumToInt(hRaw);
      var rest=cm[2]||'';
      if(rest==='半')minute=30;
      else if(rest==='一刻')minute=15;
      else if(rest==='三刻')minute=45;
      else if(rest==='钟'||rest==='')minute=0;
      else{
        var mRaw=rest.replace(/分/g,'').trim();
        if(mRaw){
          // Chinese minute: 十五, 三十, 二十, 四十五, 二十X, etc.
          var mm2=mRaw.match(/([零〇一二三四五六七八九十]+)/);
          if(mm2){
            // Split: if 十五 (10+5)=15, 二十=20, 三十=30, 四十五=45
            var mStr=mm2[1];
            minute=cnNumToInt(mStr);
          }else if(/^\d+$/.test(mRaw)){
            minute=parseInt(mRaw,10);
          }
        }
      }
    }
  }
  // 睡前 default
  if(/睡前/.test(text)&&hour===null){hour=22;minute=30;if(!targetDate){targetDate=new Date(today);result.dateText='今天';}}

  // Apply period adjustment
  if(hour!==null){
    if(period==='pm'&&hour<12)hour+=12;
    if(period==='noon'&&hour===12)hour=12;
    if(period==='noon'&&hour<12)hour=12;
    if(period==='wee'&&hour===12)hour=0;
    if(period==='wee'&&hour>=1&&hour<=6){/* keep */}
    if(period==='am'&&hour===12)hour=0;
    // Default: if hour is 1-6 without period, keep as morning (not afternoon)
    // If hour is 7-11 without period, treat as morning
    // If hour is 1-6 and appears with 晚/夜, treat as pm+12 (handled above)
    minute=minute||0;
    if(hour>23){hour=23;minute=59;}
    result.timeText=pad2(hour)+':'+pad2(minute);
  }

  // If no date but have time → default today
  if(!targetDate&&hour!==null){
    targetDate=new Date(today);
    result.dateText='今天';
  }

  // If no date and no time but is habit/anniversary, leave date empty (display-only for those)
  // If reminder with no date/time at all, default today
  if(!targetDate&&result.recordKind==='reminder'&&!relMin&&result.repeat==='none'){
    targetDate=new Date(today);
    result.dateText='今天';
  }

  // Build dateKey
  if(targetDate){
    result.dateKey=targetDate.getFullYear()+'-'+pad2(targetDate.getMonth()+1)+'-'+pad2(targetDate.getDate());
  }

  // === 5. Title cleaning ===
  var clean=text;
  // Remove date words
  var dateWords=['大后天','后天','明天','今天','昨天','下个月','下月','每月底','每月末','月底','月末','今晚'];
  dateWords.forEach(function(w){clean=clean.split(w).join('');});
  // Remove week patterns (including 每 prefix for habits)
  clean=clean.replace(/每?(下下|下|这|本)?(周|星期)[一二三四五六日天]/g,'');
  // Remove exact date YYYY?MM?DD
  clean=clean.replace(/(?:\d{4}\s*年)?\s*\d{1,2}\s*[月/\-]\s*\d{1,2}\s*[日号]?/g,'');
  // Remove standalone day numbers left after removing 每月 (1号, 15号, 30日 etc.)
  clean=clean.replace(/\d{1,2}\s*[日号]/g,'');
  // Remove relative time
  clean=clean.replace(/(\d+|[一二两三四五六七八九十]+|半)\s*(?:个)?\s*(?:小时|钟头|分钟|分|天后?)(?:后)?/g,'');
  clean=clean.replace(/半小时后?/g,'');
  clean=clean.replace(/一周后|1周后|一个星期后/g,'');
  clean=clean.replace(/马上|立刻|即刻|待会|等一下|等会|一会儿|一会|等一等|稍后|稍等|过会儿|过一会/g,'');
  // Remove period words
  clean=clean.replace(/凌晨|清晨|早上|早晨|上午|中午|正午|下午|晚上|夜里|夜晚|晚间|睡前/g,'');
  // Remove clock expressions
  clean=clean.replace(/\d{1,2}:\d{2}/g,'');
  clean=clean.replace(/[零〇一二两三四五六七八九十\d]{1,3}\s*点\s*(钟|半|一刻|三刻|(?:[零〇一二三四五六七八九十\d]{1,3})\s*分?)?/g,'');
  // Remove repeat words
  clean=clean.replace(/每天|每日|天天|每周|每月|每年|每个星期|每个月/g,'');
  // Remove filler words - prefix/suffix fillers (modal/command words at edges)
  var edgeFillers=['要','记得','别忘了','给我','帮我','去','往','过','得'];
  edgeFillers.forEach(function(w){
    var pat=new RegExp('^'+w+'+|'+w+'+$','g');
    clean=clean.replace(pat,'');
  });
  // Mid-sentence fillers that are always safe to remove globally
  ['提醒我'].forEach(function(w){clean=clean.split(w).join('');});
  // Remove extra punctuation/whitespace
  clean=clean.replace(/[，,。.、\s]+/g,'').trim();

  // Infer record kind from cleaned title
  result.recordKind=inferRecordKindFromText(clean+text);
  if(result.repeat==='daily'||result.repeat==='weekly'||result.repeat==='monthly')result.recordKind='habit';
  if(result.repeat==='yearly')result.recordKind='anniversary';

  result.title=clean||text.replace(/\s+/g,'').slice(0,30);
  return result;
}

function inferRecordKind(r){
  if(r.recordKind)return r.recordKind;
  var t=(r.title||'')+(r.rawText||'');
  return inferRecordKindFromText(t);
}

/* ========== Date helpers ========== */
function getRecordTargetDateTime(r,opts){
  opts=opts||{};
  var allowPast=opts.allowPast||false;
  var now=new Date();
  // Relative minutes (for 待会/稍后 etc.)
  if(r.relativeMinutes){
    // relative from created time if available, else now
    var base=r.createdAt||now.getTime();
    return new Date(base+r.relativeMinutes*60000);
  }
  if(!r.dateKey&&!r.timeText){
    // Anniversary with only title
    if(r.recordKind==='anniversary')return null;
    return null;
  }
  var d;
  if(r.dateKey){
    var parts=r.dateKey.split('-').map(function(x){return parseInt(x,10);});
    d=new Date(parts[0],parts[1]-1,parts[2]);
  }else{
    d=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  }
  if(r.timeText){
    var tp=r.timeText.split(':').map(function(x){return parseInt(x,10);});
    d.setHours(tp[0]||0,tp[1]||0,0,0);
  }else{
    d.setHours(0,0,0,0);
  }
  // For anniversary past dates, roll forward to next occurrence
  if(r.recordKind==='anniversary'&&r.repeat==='yearly'&&d.getTime()<now.getTime()-86400000){
    // Don't roll in getTarget; callers handle "已记录X天"
  }
  if(!allowPast&&r.recordKind!=='anniversary'&&!r.repeat||r.repeat==='none'){
    // For one-off reminders, if date has passed and is >2h ago, still return as-is
  }
  return d;
}

function normalizeRecord(r){
  if(!r.recordKind)r.recordKind=inferRecordKind(r);
  if(!r.cardStyle)r.cardStyle=(r.recordKind==='anniversary')?'large':'normal';
  if(typeof r.monthEnd!=='boolean')r.monthEnd=isMonthEndRepeatRecord(r);
  var d=getRecordTargetDateTime(r);
  if(d&&!r.dateKey)r.dateKey=d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
  return r;
}

/* ========== Live Countdown ========== */
function formatLiveCountdown(r){
  if(r.repeat&&r.repeat!=='none'&&r.recordKind!=='anniversary'){
    if(r.timeText)return{text:(r.dateText||t('today'))+' '+r.timeText,cls:''};
    return{text:r.repeatText||repeatLabel(r.repeat),cls:''};
  }
  var target=getRecordTargetDateTime(r,{allowPast:r.recordKind==='anniversary'});
  if(!target){
    if(r.recordKind==='anniversary')return{text:'',cls:''};
    return r.dateText?{text:r.dateText,cls:''}:null;
  }
  var now=new Date();
  // Anniversary: calculate days recorded / days until
  if(r.recordKind==='anniversary'){
    var start=new Date(target);
    if(r.repeat==='yearly'){
      // Next anniversary this year or next
      var nextAnn=new Date(now.getFullYear(),start.getMonth(),start.getDate());
      if(nextAnn.getTime()<now.getTime()-86400000)nextAnn.setFullYear(now.getFullYear()+1);
      var daysTo=Math.ceil((nextAnn-setHoursZero(now))/86400000);
      var yearsSince=now.getFullYear()-start.getFullYear();
      if(start.getMonth()>now.getMonth()||(start.getMonth()===now.getMonth()&&start.getDate()>now.getDate()))yearsSince--;
      if(daysTo===0)return{text:t('today'),cls:'today'};
      if(daysTo===1)return{text:t('tomorrow'),cls:'soon'};
      if(yearsSince>0)return{text:'已记录 '+yearsSince+' 年',cls:'memory'};
      return{text:tf('dayCountdown',{d:daysTo}),cls:''};
    }else{
      var daysAbs=Math.floor((now-start)/86400000);
      if(daysAbs<0)return{text:tf('dayCountdown',{d:-daysAbs}),cls:''};
      if(daysAbs===0)return{text:'第 1 天',cls:'today'};
      return{text:'已记录 '+daysAbs+' 天',cls:'memory'};
    }
  }

  var diff=target.getTime()-now.getTime();
  var abs=Math.abs(diff);
  var mins=Math.floor(abs/60000);
  var hrs=Math.floor(abs/3600000);
  var days=Math.floor(abs/86400000);
  if(diff>=0){
    if(mins<1)return{text:t('now'),cls:'today'};
    if(mins<60)return{text:tf('minCountdown',{n:mins}),cls:'today'};
    if(hrs<24)return{text:tf('hourCountdown',{h:hrs,m:mins%60}),cls:'soon'};
    if(days===1)return{text:tf('tomorrowTime',{t:r.timeText||''}),cls:'soon'};
    if(days<48)return{text:tf('tomorrowTime',{t:r.timeText||''}),cls:'soon'};
    return{text:tf('dayCountdown',{d:days}),cls:''};
  }else{
    if(mins<60)return{text:tf('overdueMin',{n:mins}),cls:'overdue'};
    if(hrs<24)return{text:tf('overdueHour',{h:hrs}),cls:'overdue'};
    return{text:tf('overdueDay',{d:days}),cls:'overdue'};
  }
}
function setHoursZero(d){var x=new Date(d);x.setHours(0,0,0,0);return x;}
function repeatLabel(rep){
  return{daily:'每日',weekly:'每周',monthly:'每月',yearly:'每年',none:''}[rep]||'';
}
function formatRecordShortDate(r){
  if(!r)return'';
  return [r.dateText,r.timeText].filter(Boolean).join(' ')||r.rawText||'';
}
function getNextVisibleDate(r){
  if(!r)return null;
  var d=getRecordTargetDateTime(r,{allowPast:true});
  if(!d)return null;
  if(r.recordKind==='anniversary'&&(r.repeat==='yearly'||!r.repeat||r.repeat==='none')){
    var now=new Date();
    var today=setHoursZero(now);
    var next=new Date(now.getFullYear(),d.getMonth(),d.getDate());
    if(setHoursZero(next).getTime()<today.getTime())next.setFullYear(next.getFullYear()+1);
    return next;
  }
  if(r.repeat==='daily'){
    var daily=new Date();
    daily.setHours(d.getHours(),d.getMinutes(),0,0);
    if(daily.getTime()<Date.now())daily.setDate(daily.getDate()+1);
    return daily;
  }
  return d;
}
function daysUntilDate(d){
  if(!d)return null;
  var today=setHoursZero(new Date());
  var target=setHoursZero(d);
  return Math.round((target.getTime()-today.getTime())/86400000);
}
function formatOverviewRecord(r,anniv){
  if(!r)return'';
  var d=getNextVisibleDate(r);
  var parts=[r.title||r.rawText||t('appName')];
  if(anniv&&d){
    var diff=daysUntilDate(d);
    if(diff===0)parts.push(t('today'));
    else parts.push(tf('dayCountdown',{d:diff}));
  }else{
    var meta=formatRecordShortDate(r);
    if(meta)parts.push(meta);
  }
  return parts.join(' · ');
}
function getTodayOverviewData(){
  var today=setHoursZero(new Date());
  var todayCount=0;
  var upcoming=[];
  var anniversaries=[];
  records.forEach(function(r){
    var d=getNextVisibleDate(r);
    if(d&&setHoursZero(d).getTime()===today.getTime())todayCount++;
    if(d&&r.recordKind!=='anniversary'&&setHoursZero(d).getTime()>=today.getTime())upcoming.push({record:r,date:d});
    if(r.recordKind==='anniversary'&&d)anniversaries.push({record:r,date:d});
  });
  upcoming.sort(function(a,b){return a.date-b.date;});
  anniversaries.sort(function(a,b){return a.date-b.date;});
  return {todayCount:todayCount,next:upcoming[0]&&upcoming[0].record,anniversary:anniversaries[0]&&anniversaries[0].record};
}
function renderTodayOverview(){
  var el=$('todayOverviewBlock');if(!el)return;
  if(!records.length){
    el.innerHTML='<div class="today-overview">'+
      '<div class="today-overview-title"><span class="today-overview-kicker">'+t('todayOverview')+'</span><span class="today-overview-count">0</span></div>'+
      '<div class="today-overview-lines"><div class="today-overview-line"><span class="today-overview-value">'+t('overviewEmpty')+'</span></div>'+
      '<button class="demo-btn" onclick="addDemoRecords()">'+t('demoAction')+'</button></div>'+
    '</div>';
    return;
  }
  var data=getTodayOverviewData();
  el.innerHTML='<div class="today-overview">'+
    '<div class="today-overview-title"><span class="today-overview-kicker">'+t('todayOverview')+'</span><span class="today-overview-count">'+tf('todayOverviewCount',{n:data.todayCount})+'</span></div>'+
    '<div class="today-overview-lines">'+
      '<div class="today-overview-line"><span class="today-overview-label">'+t('overviewNext')+'</span><span class="today-overview-value">'+escHtml(data.next?formatOverviewRecord(data.next,false):t('overviewNoNext'))+'</span></div>'+
      '<div class="today-overview-line"><span class="today-overview-label">'+t('overviewAnniv')+'</span><span class="today-overview-value">'+escHtml(data.anniversary?formatOverviewRecord(data.anniversary,true):t('overviewNoAnniv'))+'</span></div>'+
    '</div></div>';
}
var demoRouteCollapsed=true;
function readDemoRouteCollapsed(){
  try{
    var v=localStorage.getItem(DEMO_ROUTE_COLLAPSED_KEY);
    if(v==='false')return false;
    if(v==='true')return true;
  }catch(e){}
  return true;
}
function persistDemoRouteCollapsed(value){
  demoRouteCollapsed=!!value;
  try{localStorage.setItem(DEMO_ROUTE_COLLAPSED_KEY,demoRouteCollapsed?'true':'false');}catch(e){}
}
function toggleDemoRoute(){
  persistDemoRouteCollapsed(!demoRouteCollapsed);
  renderDemoRoute();
}
function demoRouteStep(num,title,copy,example,actionText,action){
  var button=actionText?'<div class="demo-route-actions"><button class="import-btn" onclick="'+action+'">'+escHtml(actionText)+'</button></div>':'';
  var sample=example?'<div class="demo-route-example">'+escHtml(example)+'</div>':'';
  return '<div class="demo-route-step" data-demo-route-step="'+num+'">'+
    '<div class="demo-route-step-num">'+num+'</div>'+
    '<div><div class="demo-route-step-title">'+escHtml(title)+'</div>'+
    '<div class="demo-route-copy">'+copy+'</div>'+sample+button+'</div>'+
  '</div>';
}
function renderDemoRoute(){
  var el=$('demoRouteBlock');if(!el)return;
  var collapsed=demoRouteCollapsed;
  var dedupeCopy=escHtml(t('demoRouteDedupeCopy'))+
    '<ul style="margin:6px 0 0 18px;padding:0;">'+
    '<li>'+escHtml(t('demoRouteDedupePoint1'))+'</li>'+
    '<li>'+escHtml(t('demoRouteDedupePoint2'))+'</li></ul>';
  var body=
    demoRouteStep(1,t('demoRouteOneTitle'),escHtml(t('demoRouteOneCopy')),t('demoRouteOneExample'),t('demoRouteOneAction'),'fillDemoRouteSentence()')+
    demoRouteStep(2,t('demoRouteBatchTitle'),escHtml(t('demoRouteBatchCopy')),t('demoRouteBatchExample'),t('demoRouteBatchAction'),'openDemoRouteBatch()')+
    demoRouteStep(3,t('demoRouteDedupeTitle'),dedupeCopy,'','','')+
    demoRouteStep(4,t('demoRouteCalendarTitle'),escHtml(t('demoRouteCalendarCopy')),'',t('demoRouteCalendarAction'),'jumpDemoRouteCalendarExport()')+
    demoRouteStep(5,t('demoRouteSafetyTitle'),escHtml(t('demoRouteSafetyCopy')),'',t('demoRouteSafetyAction'),'jumpDemoRouteDataSafety()');
  var hint=records.length?'':'<div class="demo-route-copy">'+escHtml(t('demoRouteEmptyHint'))+'</div>';
  el.innerHTML='<section class="demo-route-card '+(collapsed?'collapsed':'')+'" aria-label="'+escAttr(t('demoRouteEntryTitle'))+'">'+
    '<div class="demo-route-head">'+
      '<div><div class="demo-route-title">'+escHtml(t('demoRouteEntryTitle'))+'</div><div class="demo-route-sub">'+escHtml(t('demoRouteEntrySub'))+'</div></div>'+
      '<button class="demo-route-toggle" id="demoRouteToggle" onclick="toggleDemoRoute()" aria-expanded="'+(!collapsed)+'">'+(collapsed?t('demoRouteExpand'):t('demoRouteCollapse'))+'</button>'+
    '</div>'+
    '<div class="demo-route-body" id="demoRouteBody">'+hint+body+'</div>'+
  '</section>';
}
function fillDemoRouteSentence(){
  switchPage('home');
  demoRouteCollapsed=false;
  persistDemoRouteCollapsed(false);
  var inp=$('quickInput');
  if(inp){
    inp.value=t('demoRouteOneExample');
    autoResizeInput();
    if(isParsePreviewEnabled())showParsePreview(inp.value);
    inp.focus();
  }
  renderDemoRoute();
}
function openDemoRouteBatch(){
  demoRouteCollapsed=false;
  persistDemoRouteCollapsed(false);
  switchPage('import');
  var input=$('importTextInput');
  if(input)input.value=t('demoRouteBatchExample');
  importDrafts=prepareBatchCaptureDrafts(t('demoRouteBatchExample'));
  renderImport();
}
function jumpToMySection(sectionId){
  switchPage('my');
  setTimeout(function(){
    var el=$(sectionId);
    if(el&&el.scrollIntoView)el.scrollIntoView({block:'start',behavior:'smooth'});
  },50);
}
function jumpDemoRouteCalendarExport(){jumpToMySection('calendarExportSection');}
<<<<<<< HEAD
function jumpDemoRouteDataSafety(){jumpToMySection('dataSafetySection');}
=======
function jumpDemoRouteDataSafety(){jumpToMySection('dataBackupSection');}
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
function getTimelineGroups(){
  var today=setHoursZero(new Date());
  var tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);
  var weekEnd=new Date(today);weekEnd.setDate(today.getDate()+6);
  var groups={
    today:[],tomorrow:[],week:[],future:[],undated:[]
  };
  records.forEach(function(r){
    var d=getNextVisibleDate(r);
    if(!d){groups.undated.push(r);return;}
    var day=setHoursZero(d);
    if(day.getTime()===today.getTime())groups.today.push(r);
    else if(day.getTime()===tomorrow.getTime())groups.tomorrow.push(r);
    else if(day.getTime()>tomorrow.getTime()&&day.getTime()<=weekEnd.getTime())groups.week.push(r);
    else groups.future.push(r);
  });
  Object.keys(groups).forEach(function(k){
    groups[k].sort(function(a,b){
      var da=getNextVisibleDate(a),db=getNextVisibleDate(b);
      if(da&&db)return da-db;
      return(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0);
    });
  });
  return groups;
}
function timelineMetaForRecord(r){
  var d=getNextVisibleDate(r);
  if(!d)return r.recordKind?({reminder:t('reminder'),anniversary:t('anniversary'),habit:t('habit'),note:t('note')}[r.recordKind]||''):'';
  return formatRecordShortDate(r)||dateTextFromDate(d);
}
function renderTimelineItem(r){
  return '<div class="timeline-item" onclick="openDetail(\''+r.id+'\')">'+
    '<span class="timeline-dot"></span>'+
    '<span class="timeline-item-title">'+escHtml(r.title||r.rawText||'')+'</span>'+
    '<span class="timeline-item-meta">'+escHtml(timelineMetaForRecord(r))+'</span>'+
  '</div>';
}
function renderTimelineGroup(key,title,copyKey,emptyKey,items){
  var html='<div class="timeline-group" data-timeline-group="'+key+'">'+
    '<div class="timeline-group-head"><span class="timeline-group-title">'+title+'</span><span class="timeline-group-count">'+tf(copyKey,{n:items.length})+'</span></div>';
  if(items.length){
    items.slice(0,3).forEach(function(r){html+=renderTimelineItem(r);});
  }else{
    html+='<div class="timeline-empty">'+t(emptyKey)+'</div>';
  }
  html+='</div>';
  return html;
}
function renderTimeline(){
  var el=$('timelineBlock');if(!el)return;
  var g=getTimelineGroups();
  el.innerHTML='<div class="timeline-panel" id="timeJourney">'+
    '<div class="timeline-head"><div><div class="timeline-title">'+t('timelineTitle')+'</div><div class="timeline-sub">'+t('timelineSub')+'</div></div><div class="card-section-count">'+records.length+'</div></div>'+
    '<div class="timeline-groups">'+
      renderTimelineGroup('today',t('timelineToday'),'timelineTodayCopy','timelineEmptyToday',g.today)+
      renderTimelineGroup('tomorrow',t('timelineTomorrow'),'timelineTomorrowCopy','timelineEmptyTomorrow',g.tomorrow)+
      renderTimelineGroup('week',t('timelineWeek'),'timelineWeekCopy','timelineEmptyWeek',g.week)+
      renderTimelineGroup('future',t('timelineFuture'),'timelineFutureCopy','timelineEmptyFuture',g.future)+
      renderTimelineGroup('undated',t('timelineUndated'),'timelineUndatedCopy','timelineEmptyUndated',g.undated)+
    '</div></div>';
}
var PARSE_PREVIEW_KEY='shike_parse_preview_enabled';
var pendingParsePreview=null;
var parsePreviewTimer=null;
var exampleChipTexts=['明天下午三点开会','每月15号还信用卡','7月8日妈妈生日','每天睡前涂润唇膏','周末整理房间'];
function isParsePreviewEnabled(){
  try{return localStorage.getItem(PARSE_PREVIEW_KEY)!=='false';}catch(e){return true;}
}
function setParsePreviewEnabled(enabled){
  try{localStorage.setItem(PARSE_PREVIEW_KEY,enabled?'true':'false');}catch(e){}
  renderParsePreview();
}
function isPendingPreviewForText(text){
  return !!(pendingParsePreview&&pendingParsePreview.raw===(text||'').trim());
}
function cloneParsedRecord(parsed){
  return Object.assign({},parsed||{});
}
function shouldTreatAsUndatedIdea(text,parsed){
  if(!text||!parsed)return false;
  if(hasExplicitDateInput(text)||parsed.repeat&&parsed.repeat!=='none')return false;
  return /想法|备忘|清单|灵感|笔记/.test(text);
}
function normalizeCapturePreviewParsed(text,parsed){
  if(!parsed||!parsed.title){
    return {title:text,dateText:'',dateKey:'',timeText:'',recordKind:'note',repeat:'none',repeatText:'',rawText:text,relativeMinutes:null,monthEnd:false};
  }
  if(shouldTreatAsUndatedIdea(text,parsed)){
    parsed=cloneParsedRecord(parsed);
    parsed.dateText='';parsed.dateKey='';parsed.timeText='';
    parsed.recordKind='note';parsed.repeat='none';parsed.repeatText='';parsed.relativeMinutes=null;
  }
  return parsed;
}
function parsePreviewKindLabel(kind){
  return {reminder:t('reminder'),anniversary:t('anniversary'),habit:t('habit'),note:t('note')}[kind]||kind||'';
}
function parsePreviewRepeatLabel(rep){
  return repeatLabel(rep||'none')||'不重复';
}
function parsePreviewCalendarState(parsed){
  return parsed&&parsed.dateKey?'可加入':'无日期';
}
function parsePreviewIcsState(parsed){
  return parsed&&parsed.dateKey?'可导出 .ics':'不可导出';
}
function buildPreviewField(label,value){
  return '<div class="parse-preview-field"><div class="parse-preview-label">'+label+'</div><div class="parse-preview-value">'+escHtml(value||'--')+'</div></div>';
}
function renderPreviewChips(title,group,current,items){
  var html='<div class="preview-chip-row" data-correction-group="'+group+'"><span class="parse-preview-label" style="align-self:center;">'+title+'</span>';
  items.forEach(function(item){
    html+='<button class="preview-chip'+(item.value===current?' active':'')+'" onclick="applyPreviewCorrection(\''+group+'\',\''+item.value+'\')">'+item.label+'</button>';
  });
  html+='</div>';
  return html;
}
function renderParsePreview(){
  var el=$('parsePreviewBlock');if(!el)return;
  if(!isParsePreviewEnabled()){
    el.innerHTML='<div class="parse-preview"><div class="parse-preview-head"><div class="parse-preview-title">解析预览已关闭</div><label class="parse-preview-toggle"><input type="checkbox" onchange="setParsePreviewEnabled(this.checked)"> 开启解析预览</label></div></div>';
    return;
  }
  if(!pendingParsePreview){el.innerHTML='';return;}
  var p=pendingParsePreview.parsed||{};
  var html='<div class="parse-preview" id="parsePreviewCard">'+
    '<div class="parse-preview-head"><div class="parse-preview-title">我理解为</div><label class="parse-preview-toggle"><input type="checkbox" checked onchange="setParsePreviewEnabled(this.checked)"> 解析预览</label></div>'+
    '<div class="parse-preview-grid">'+
      buildPreviewField('类型',parsePreviewKindLabel(p.recordKind))+
      buildPreviewField('标题',p.title)+
      buildPreviewField('日期',[p.dateText,p.timeText].filter(Boolean).join(' '))+
      buildPreviewField('重复',parsePreviewRepeatLabel(p.repeat))+
      buildPreviewField('日历',parsePreviewCalendarState(p))+
      buildPreviewField('导出',parsePreviewIcsState(p))+
    '</div>'+
    renderPreviewChips('类型','kind',p.recordKind,[{label:t('reminder'),value:'reminder'},{label:t('anniversary'),value:'anniversary'},{label:t('habit'),value:'habit'},{label:t('note'),value:'note'}])+
    renderPreviewChips('重复','repeat',p.repeat||'none',[{label:'不重复',value:'none'},{label:'每天',value:'daily'},{label:'每月',value:'monthly'},{label:'每年',value:'yearly'}])+
    renderPreviewChips('日期','date',p._dateChoice||'keep',[{label:'保持解析结果',value:'keep'},{label:t('today'),value:'today'},{label:t('tomorrow'),value:'tomorrow'},{label:'无日期',value:'none'}])+
    renderPreviewChips('时间','time',p._timeChoice||'keep',[{label:'保持解析结果',value:'keep'},{label:'无时间',value:'none'},{label:'上午 9:00',value:'morning'},{label:'下午 3:00',value:'afternoon'},{label:'晚上 8:00',value:'evening'}])+
    '<div class="parse-preview-actions">'+
      '<button class="import-btn" onclick="confirmParsePreview()">确认创建</button>'+
      '<button class="import-btn" onclick="continueEditingPreview()">继续修改</button>'+
      '<button class="import-btn" onclick="directSaveFromInput()">直接保存</button>'+
    '</div>'+
  '</div>';
  el.innerHTML=html;
}
function showParsePreview(rawText){
  var text=(rawText||'').trim();
  if(!text){pendingParsePreview=null;renderParsePreview();return null;}
  pendingParsePreview=null;
  renderParsePreview();
  var parsed=normalizeCapturePreviewParsed(text,parseReminderText(text));
  pendingParsePreview={raw:text,parsed:cloneParsedRecord(parsed)};
  renderParsePreview();
  return pendingParsePreview;
}
function applyPreviewCorrection(group,value){
  if(!pendingParsePreview)return;
  var p=pendingParsePreview.parsed;
  if(group==='kind'){
    p.recordKind=value;
    if(value==='anniversary'&&(!p.repeat||p.repeat==='none'))p.repeat='yearly';
    if(value!=='anniversary'&&p.repeat==='yearly')p.repeat='none';
    p.cardStyle=value==='anniversary'?'large':'normal';
  }else if(group==='repeat'){
    p.repeat=value;
    if(value==='yearly')p.recordKind='anniversary';
  }else if(group==='date'){
    p._dateChoice=value;
    var today=setHoursZero(new Date());
    if(value==='today'){p.dateKey=dateKeyFromDate(today);p.dateText=t('today');}
    else if(value==='tomorrow'){var tm=new Date(today);tm.setDate(today.getDate()+1);p.dateKey=dateKeyFromDate(tm);p.dateText=t('tomorrow');}
    else if(value==='none'){p.dateKey='';p.dateText='';}
  }else if(group==='time'){
    p._timeChoice=value;
    if(value==='none')p.timeText='';
    else if(value==='morning')p.timeText='09:00';
    else if(value==='afternoon')p.timeText='15:00';
    else if(value==='evening')p.timeText='20:00';
  }
  renderParsePreview();
}
function confirmParsePreview(){
  if(!pendingParsePreview)return;
  var inp=$('quickInput');
  var p=cloneParsedRecord(pendingParsePreview.parsed);
  delete p._dateChoice;delete p._timeChoice;
  saveParsedRecord(p,pendingParsePreview.raw);
  pendingParsePreview=null;
  if(inp){inp.value='';autoResizeInput();}
  renderParsePreview();
  showToast(t('saved'),'success');
  switchPage('home');renderHome();startCountdownTicker();
}
function continueEditingPreview(){
  var inp=$('quickInput');
  if(inp){inp.focus();autoResizeInput();}
}
function directSaveFromInput(){
  if(inputSaveLocked)return;
  var inp=$('quickInput');
  var text=(inp.value||'').trim();
  if(!text){showToast(t('emptyInput'),'warn');return;}
<<<<<<< HEAD
=======
  if(window.ShikeChronosWeb&&window.ShikeChronosWeb.captureIfNeeded(text))return;
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  if(captureBatchFromInput(text))return;
  var parsed=normalizeCapturePreviewParsed(text,parseReminderText(text));
  inputSaveLocked=true;
  saveParsedRecord(parsed,text);
  inp.value='';autoResizeInput();
  pendingParsePreview=null;renderParsePreview();
  showToast(t('saved'),'success');
  switchPage('home');renderHome();startCountdownTicker();
  setTimeout(function(){inputSaveLocked=false;},500);
}
function renderExampleChips(){
  var el=$('exampleChips');if(!el)return;
  el.innerHTML=exampleChipTexts.map(function(text){
    return '<button class="example-chip" onclick="useExampleChip(\''+escAttr(text)+'\')">'+escHtml(text)+'</button>';
  }).join('');
}
function useExampleChip(text){
  var inp=$('quickInput');if(!inp)return;
  inp.value=text;autoResizeInput();
  if(isParsePreviewEnabled())showParsePreview(text);
  inp.focus();
}
function getUndatedRecords(){
  return records.filter(function(r){return !r.dateKey;}).sort(function(a,b){return(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0);});
}
function setRecordDateQuick(id,mode){
  var r=records.find(function(x){return x.id===id;});if(!r)return;
  if(mode==='none'){r.dateKey='';r.dateText='';}
  else{
    var d=setHoursZero(new Date());
    if(mode==='tomorrow')d.setDate(d.getDate()+1);
    r.dateKey=dateKeyFromDate(d);
    r.dateText=mode==='tomorrow'?t('tomorrow'):t('today');
  }
  r.updatedAt=Date.now();
  saveRecords();renderImport();renderTimeline();renderTodayOverview();showToast(t('updated'),'success');
}
function renderLaterInbox(){
  var el=$('laterInboxBlock');if(!el)return;
  var items=getUndatedRecords();
  var html='<div class="later-inbox" id="laterInbox">'+
    '<div class="later-head"><div class="later-title">稍后整理</div><div class="later-count">'+items.length+' 条无日期</div></div>'+
    '<div class="later-note">这些想法还没有落到具体日期，可以之后再补充。</div>';
  if(items.length){
    items.slice(0,3).forEach(function(r){
      html+='<div class="later-item"><div class="later-item-title">'+escHtml(r.title||r.rawText||'')+'</div>'+
        '<div class="later-actions">'+
          '<button class="later-action" onclick="openDetail(\''+r.id+'\')">查看</button>'+
          '<button class="later-action" onclick="setRecordDateQuick(\''+r.id+'\',\'today\')">设为今天</button>'+
          '<button class="later-action" onclick="setRecordDateQuick(\''+r.id+'\',\'tomorrow\')">设为明天</button>'+
          '<button class="later-action" onclick="setRecordDateQuick(\''+r.id+'\',\'none\')">保持无日期</button>'+
        '</div></div>';
    });
  }else html+='<div class="timeline-empty">没有需要稍后整理的记录。</div>';
  html+='</div>';
  el.innerHTML=html;
}

/* ========== Clock ========== */
var clockTimer=null;
function startHomeClock(){
  updateHomeClock();
  if(clockTimer)clearInterval(clockTimer);
  clockTimer=setInterval(updateHomeClock,30000);
}
function updateHomeClock(){
  var now=new Date();
  var txt=formatClock(now);
  var b=$('homeClockBig'),s=$('homeClockSmall');
  if(b)b.textContent=txt;
  if(s)s.textContent=txt;
}
function formatClock(d){
  var y=d.getFullYear(),mo=d.getMonth()+1,da=d.getDate(),h=d.getHours(),mi=d.getMinutes();
  if(LANG==='en'){
    var months=[t('jan'),t('feb'),t('mar'),t('apr'),t('may'),t('jun'),t('jul'),t('aug'),t('sep'),t('oct'),t('nov'),t('dec')];
    return months[mo-1]+' '+da+', '+y+' '+pad2(h)+':'+pad2(mi);
  }
  if(LANG==='ja')return y+'年'+mo+'月'+da+'日 '+pad2(h)+':'+pad2(mi);
  return y+'年'+pad2(mo)+'月'+pad2(da)+'日 '+pad2(h)+':'+pad2(mi);
}

/* ========== Countdown ticker ========== */
var countdownTimer=null;
function startCountdownTicker(){
  refreshCountdowns();
  if(countdownTimer)clearInterval(countdownTimer);
  countdownTimer=setInterval(refreshCountdowns,60000);
}
function refreshCountdowns(){
  if(currentPage==='home')renderHome();
  else if(currentPage==='all')renderAll();
  else if(currentPage==='calendar'){renderCalendarDay();}
}

<<<<<<< HEAD
=======
function updatePermStatus(){
  // Notification permission
  var notifyEl=$('permNotifyStatus');
  if(notifyEl){
    if(!('Notification' in window)){notifyEl.textContent='不支持';}
    else{
      var np=Notification.permission;
      if(np==='granted')notifyEl.textContent='已授权';
      else if(np==='denied')notifyEl.textContent='已拒绝';
      else notifyEl.textContent='未授权';
    }
  }
  // Microphone permission
  var micEl=$('permMicStatus');
  if(micEl){
    if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){micEl.textContent='可请求';}
    else{micEl.textContent='不支持';}
  }
  // PWA install status
  var pwaEl=$('permPwaStatus');
  if(pwaEl){
    var isStandalone=window.matchMedia&&(window.matchMedia('(display-mode: standalone)').matches||window.matchMedia('(display-mode:standalone)').matches)||window.navigator.standalone===true;
    if(isStandalone)pwaEl.textContent='已安装';
    else if(window.deferredInstallPrompt)pwaEl.textContent='可安装';
    else pwaEl.textContent='未安装';
  }
  // Storage persist
  var storageEl=$('permStorageStatus');
  if(storageEl){
    if(navigator.storage&&typeof navigator.storage.persisted==='function'){
      navigator.storage.persisted().then(function(persisted){
        storageEl.textContent=persisted?'已持久化':'未持久化';
      }).catch(function(){storageEl.textContent='未知';});
    }else{
      storageEl.textContent='不支持';
    }
  }
}

>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
/* ========== Page navigation ========== */
var currentPage='home';
function switchPage(page){
  currentPage=page;
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  var pg=$('page-'+page);if(pg)pg.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(function(n){
    n.classList.toggle('active',n.dataset.page===page);
  });
  closeDrawer();
  if(page==='home')renderHome();
  else if(page==='calendar')renderCalendar();
  else if(page==='all')renderAll();
  else if(page==='my')renderMy();
  else if(page==='import')renderImport();
<<<<<<< HEAD
  else if(page==='watch'&&window.ShikeWatchCenter){window.ShikeWatchCenter.render();updateWatchBadge();}
=======
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  renderTimeSprite();
  window.scrollTo(0,0);
}

<<<<<<< HEAD
/* ========== Watch Badge ========== */
function updateWatchBadge(){
  var badge=document.getElementById('navWatchBadge');
  if(!badge||!window.ShikeWatchCenter)return;
  try{
    var count=window.ShikeWatchCenter.getUnreadCount();
    if(count>0){
      badge.textContent=count>99?'99+':String(count);
      badge.classList.remove('hidden');
    }else{
      badge.classList.add('hidden');
    }
  }catch(e){badge.classList.add('hidden');}
}
function openWatchCenter(){switchPage('watch');}

=======
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
/* ========== Has records state ========== */
function hasAnyRecord(){return records.length>0;}
function updateLayoutState(){
  var app=$('app');
  if(hasAnyRecord())app.classList.add('has-records');
  else app.classList.remove('has-records');
}

/* ========== Render: Hero Card ========== */
function renderHeroCard(r,compact){
  var cd=formatLiveCountdown(r);
  var preset=parseInt(r.coverPreset)||0;
  var hasCover=!!r.coverImage;
  var kindLabel={reminder:t('reminder'),anniversary:t('anniversary'),habit:t('habit'),note:t('note')}[r.recordKind]||'';
  var coverStyle='';
  if(hasCover)coverStyle="background-image:url('"+String(r.coverImage).replace(/['\\]/g,'')+"');";
  var cdText=cd?cd.text:'';
  var dateLine='';
  if(r.recordKind==='anniversary'){
    var d=getRecordTargetDateTime(r,{allowPast:true});
    if(d)dateLine=d.getFullYear()+'.'+pad2(d.getMonth()+1)+'.'+pad2(d.getDate());
  }else{
    dateLine=(r.dateText||'')+(r.timeText?' '+r.timeText:'');
  }
  var sub='';
  if(r.subtitle)sub='<div class="hero-subtitle-text">'+escHtml(r.subtitle)+'</div>';
  var acts='';
  if(r.recordKind==='reminder')acts+='<button class="hero-act" onclick="openDetail(\''+r.id+'\')">'+t('details')+'</button>';
  if(r.recordKind==='anniversary')acts+='<button class="hero-act" onclick="exportAnniversaryCardPng(\''+r.id+'\')">'+t('saveCardImage')+'</button>';
  acts+='<button class="hero-act" onclick="togglePin(\''+r.id+'\')">'+(r.pinned?t('unpin'):t('setPin'))+'</button>';
  var pinIcon=r.pinned?'<span class="hero-pin">●</span>':'';
  var minH=compact?'min-height:140px;':'';
  return '<div class="hero-card preset-'+preset+(hasCover?' has-cover':'')+'" style="'+coverStyle+minH+'" onclick="openDetail(\''+r.id+'\')">'+
    '<div class="hero-top"><span class="hero-kind">'+kindLabel+'</span>'+pinIcon+'</div>'+
    '<div>'+
      '<div class="hero-countdown">'+escHtml(cdText)+'</div>'+
      '<div class="hero-date">'+escHtml(dateLine)+'</div>'+
      '<h3 class="hero-title">'+escHtml(r.title)+'</h3>'+sub+
    '</div>'+
    '<div class="hero-actions" onclick="event.stopPropagation();">'+acts+'</div>'+
  '</div>';
}

/* ========== Render: Regular Card ========== */
function renderRecordCard(r){
  var cd=formatLiveCountdown(r);
  var cdCls=cd?cd.cls:'';
  var cdText=cd?cd.text:'';
  var kindCls='kind-'+r.recordKind;
  var kindLabel={reminder:t('reminder'),anniversary:t('anniversary'),habit:t('habit'),note:t('note')}[r.recordKind]||'';
  var meta=[];
  if(r.dateText)meta.push(r.dateText);
  if(r.timeText)meta.push(r.timeText);
  if(r.repeat&&r.repeat!=='none')meta.push(repeatLabel(r.repeat));
  var pin=r.pinned?'<button class="rc-icon-btn rc-pin" aria-label="'+t('unpin')+'" onclick="event.stopPropagation();togglePin(\''+r.id+'\')">●</button>':'<button class="rc-icon-btn rc-pin not-pinned" aria-label="'+t('setPin')+'" onclick="event.stopPropagation();togglePin(\''+r.id+'\')">○</button>';
  var swipeActions='<div class="swipe-actions card-action-menu" aria-label="'+t('moreActions')+'">'+
    '<button class="swipe-action card-action-edit" aria-label="'+t('edit')+'" onclick="event.stopPropagation();closeCardMenus();openEditDrawer(\''+r.id+'\')">'+t('edit')+'</button>'+
    '<button class="swipe-action card-action-copy" aria-label="'+t('copyRecord')+'" onclick="event.stopPropagation();closeCardMenus();copyRecordText(\''+r.id+'\')">'+t('copyRecord')+'</button>'+
    '<button class="swipe-action card-action-pin" aria-label="'+(r.pinned?t('unpin'):t('setPin'))+'" onclick="event.stopPropagation();closeCardMenus();togglePin(\''+r.id+'\')">'+(r.pinned?t('unpin'):t('setPin'))+'</button>'+
    (r.dateKey?'<button class="swipe-action card-action-ics" aria-label="'+t('exportRecordIcs')+'" onclick="event.stopPropagation();closeCardMenus();exportRecordIcsFile(\''+r.id+'\')">'+t('exportRecordIcs')+'</button>':'')+
    (r.recordKind==='anniversary'?'<button class="swipe-action card-action-memorial" aria-label="'+t('saveCardImage')+'" onclick="event.stopPropagation();closeCardMenus();exportAnniversaryCardPng(\''+r.id+'\')">'+t('saveCardImage')+'</button>':'')+
    '<button class="swipe-action danger card-action-delete" aria-label="'+t('delete')+'" onclick="event.stopPropagation();closeCardMenus();deleteRecord(\''+r.id+'\')">'+t('delete')+'</button>'+
  '</div>';
  var moreItems=
    '<button class="card-more-item" onclick="event.stopPropagation();closeCardMenus();openEditDrawer(\''+r.id+'\')">'+t('edit')+'</button>'+
    '<button class="card-more-item" onclick="event.stopPropagation();closeCardMenus();togglePin(\''+r.id+'\')">'+(r.pinned?t('unpin'):t('setPin'))+'</button>'+
    '<button class="card-more-item" onclick="event.stopPropagation();closeCardMenus();copyRecordText(\''+r.id+'\')">'+t('copyRecord')+'</button>'+
    (r.dateKey?'<button class="card-more-item" onclick="event.stopPropagation();closeCardMenus();exportRecordIcsFile(\''+r.id+'\')">'+t('exportRecordIcs')+'</button>':'')+
    (r.recordKind==='anniversary'?'<button class="card-more-item" onclick="event.stopPropagation();closeCardMenus();exportAnniversaryCardPng(\''+r.id+'\')">'+t('saveCardImage')+'</button>':'')+
    '<div class="card-more-divider"></div>'+
    '<button class="card-more-item danger" onclick="event.stopPropagation();closeCardMenus();deleteRecord(\''+r.id+'\')">'+t('delete')+'</button>';
  var editBtn='<button class="rc-icon-btn rc-edit-btn" aria-label="'+t('edit')+'" onclick="event.stopPropagation();openEditDrawer(\''+r.id+'\')">\u270E</button>';
  var moreBtn='<button class="rc-icon-btn rc-more-btn" aria-label="'+t('moreActions')+'" aria-haspopup="true" aria-expanded="false" onclick="event.stopPropagation();toggleCardMoreMenu(\''+r.id+'\')">\u22EF</button>';
  var moreMenu='<div class="card-more-menu" data-menu-for="'+r.id+'" role="menu">'+moreItems+'</div>';
  return '<div class="record-swipe" data-record-id="'+r.id+'">'+swipeActions+moreMenu+'<div class="record-card" onclick="openDetail(\''+r.id+'\')" tabindex="0">'+
    '<div class="rc-main">'+
      '<div class="rc-title">'+escHtml(r.title)+'</div>'+
      '<div class="rc-meta">'+
        '<span class="rc-chip '+kindCls+'">'+kindLabel+'</span>'+
        (meta.length?'<span>'+escHtml(meta.join(' \u00B7 '))+'</span>':'')+
      '</div>'+
    '</div>'+
    '<div class="rc-countdown '+cdCls+'">'+escHtml(cdText)+'</div>'+
    '<div class="rc-actions">'+editBtn+pin+moreBtn+'</div>'+
  '</div></div>';
}
function closeCardMenus(except){
  document.querySelectorAll('.record-swipe.swiped').forEach(function(card){
    if(card!==except)card.classList.remove('swiped');
  });
  document.querySelectorAll('.card-more-menu.open').forEach(function(menu){
    if(except&&menu.parentElement===except)return;
    menu.classList.remove('open');
    var btn=menu.parentElement&&menu.parentElement.querySelector('.rc-more-btn');
    if(btn)btn.setAttribute('aria-expanded','false');
  });
}
function closeSwipeCards(except){closeCardMenus(except);}
function toggleRecordActions(id){
  var card=document.querySelector('.record-swipe[data-record-id="'+id+'"]');
  if(!card)return;
  var open=!card.classList.contains('swiped');
  closeCardMenus(open?card:null);
  card.classList.toggle('swiped',open);
}
function toggleCardMoreMenu(id){
  var card=document.querySelector('.record-swipe[data-record-id="'+id+'"]');
  if(!card)return;
  var menu=card.querySelector('.card-more-menu');
  var btn=card.querySelector('.rc-more-btn');
  if(!menu)return;
  var isOpen=menu.classList.contains('open');
  closeCardMenus(null);
  if(!isOpen){
    menu.classList.add('open');
    if(btn)btn.setAttribute('aria-expanded','true');
  }
}
function isCoarsePointer(){
  if(window.matchMedia){
    return window.matchMedia('(hover:none)').matches||window.matchMedia('(pointer:coarse)').matches;
  }
  return false;
}
function getSwipeRailWidth(card){
  var rail=card.querySelector('.swipe-actions');
  if(!rail)return 240;
  return rail.offsetWidth||240;
}
function initSwipeActions(){
  var startX=0,startY=0,target=null,tracking=false,swiping=false,currentDx=0;
  document.addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse')return;
    target=e.target&&e.target.closest?e.target.closest('.record-swipe'):null;
    if(!target)return;
    if(e.target.closest('.swipe-action')||e.target.closest('.card-more-menu')||e.target.closest('.rc-icon-btn')){
      tracking=false;return;
    }
    startX=e.clientX;startY=e.clientY;tracking=true;swiping=false;currentDx=0;
    closeCardMenus(target);
    try{e.target.setPointerCapture&&e.target.setPointerCapture(e.pointerId);}catch(_){}
  },{passive:true});
  document.addEventListener('pointermove',function(e){
    if(!tracking||!target)return;
    var dx=e.clientX-startX,dy=e.clientY-startY;
    if(!swiping){
      if(Math.abs(dx)>16&&Math.abs(dx)>Math.abs(dy)*1.4){swiping=true;}
      else if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){tracking=false;return;}
    }
    if(swiping){
      var maxSwipe=getSwipeRailWidth(target);
      currentDx=Math.max(-maxSwipe,Math.min(0,dx));
      var cardEl=target.querySelector('.record-card');
      if(cardEl){
        var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
        cardEl.style.transition='none';
        if(reduced){cardEl.style.transition='';cardEl.style.transform=dx<0?'translateX(-'+maxSwipe+'px)':'translateX(0)';}
        else{cardEl.style.transform='translateX('+currentDx+'px)';}
      }
    }
  });
  document.addEventListener('pointerup',function(e){
    if(!tracking||!target){tracking=false;swiping=false;return;}
    var cardEl=target.querySelector('.record-card');
    var maxSwipe=getSwipeRailWidth(target);
    if(cardEl){cardEl.style.transition='';cardEl.style.transform='';}
    if(swiping&&currentDx<0){
      var threshold=maxSwipe*0.35;
      if(Math.abs(currentDx)>threshold){target.classList.add('swiped');closeCardMenus(target);}
      else{target.classList.remove('swiped');}
    }
    tracking=false;swiping=false;target=null;currentDx=0;
  });
  document.addEventListener('pointercancel',function(){
    if(target){var ce=target.querySelector('.record-card');if(ce){ce.style.transition='';ce.style.transform='';}target.classList.remove('swiped');}
    tracking=false;swiping=false;target=null;
  },{passive:true});
  document.addEventListener('touchcancel',function(){
    if(target){var ce=target.querySelector('.record-card');if(ce){ce.style.transition='';ce.style.transform='';}target.classList.remove('swiped');}
    tracking=false;swiping=false;target=null;
  },{passive:true});
  document.addEventListener('click',function(e){
    if(e.target&&e.target.closest){
      if(e.target.closest('.card-more-menu'))return;
      if(e.target.closest('.rc-more-btn'))return;
      if(e.target.closest('.record-swipe')){
        var card=e.target.closest('.record-swipe');
        closeCardMenus(card);
        return;
      }
    }
    closeCardMenus(null);
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){closeCardMenus(null);}
  });
  var _origSwitch=window.switchPage;
  if(_origSwitch){window.switchPage=function(){closeCardMenus(null);return _origSwitch.apply(this,arguments);};}
  window.addEventListener('orientationchange',function(){setTimeout(function(){closeCardMenus(null);},100);},{passive:true});
}

/* ========== Render: Home ========== */
function renderHome(){
<<<<<<< HEAD
=======
  // Hero greeting
  var hg=$('heroGreeting');if(hg){
    var days=getUsageDays();
    var uname=settings.username||'';
    if(uname){
      hg.textContent=tf('userDaysText',{name:uname,n:days});
    }else{
      hg.textContent=records.length===0?t('emptyGreeting'):tf('daysText',{n:days});
    }
  }
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  updateLayoutState();
  // Clock visible in topbar for has-records, big clock visible for empty
  updateHomeClock();
  renderParsePreview();
  renderTodayOverview();

  var list=records.slice().sort(function(a,b){return(b.updatedAt||b.createdAt)-(a.updatedAt||a.createdAt);});
  // Hero cards: pinned or cardStyle==='large' or anniversary
  var heroCandidates=list.filter(function(r){return r.pinned||r.cardStyle==='large'||r.recordKind==='anniversary';});
  var nowTs=Date.now();
  heroCandidates.sort(function(a,b){
    if(a.pinned!==b.pinned)return a.pinned?-1:1;
    var da=getRecordTargetDateTime(a,{allowPast:a.recordKind==='anniversary'});
    var db=getRecordTargetDateTime(b,{allowPast:b.recordKind==='anniversary'});
    var na=da?da.getTime():Infinity,nb=db?db.getTime():Infinity;
    if(a.recordKind==='anniversary'&&na<nowTs)na+=365*86400000;
    if(b.recordKind==='anniversary'&&nb<nowTs)nb+=365*86400000;
    if(isFinite(na)&&isFinite(nb))return na-nb;
    return(b.updatedAt||b.createdAt)-(a.updatedAt||a.createdAt);
  });
  var heroPicked=heroCandidates.slice(0,3);
  var heroIds={};heroPicked.forEach(function(r){heroIds[r.id]=true;});
  var heroBlock=$('heroCardsBlock');
  if(heroPicked.length>0){
    var hh='<div class="card-section"><div class="card-section-head"><div class="card-section-title">'+t('topCards')+'</div></div><div class="cards-grid">';
    heroPicked.forEach(function(r){hh+=renderHeroCard(r,false);});
    hh+='</div></div>';
    heroBlock.innerHTML=hh;
  }else{heroBlock.innerHTML='';}

  // Next: nearest upcoming non-hero
  var upcoming=list.filter(function(r){
    if(heroIds[r.id])return false;
    if(r.recordKind==='habit'&&!r.timeText)return false;
    var d=getRecordTargetDateTime(r,{allowPast:r.recordKind==='anniversary'});
    if(!d)return r.recordKind==='anniversary';
    return true;
  }).sort(function(a,b){
    var da=getRecordTargetDateTime(a,{allowPast:a.recordKind==='anniversary'}),db=getRecordTargetDateTime(b,{allowPast:b.recordKind==='anniversary'});
    return(da?da.getTime():Infinity)-(db?db.getTime():Infinity);
  });
  var nextBlock=$('nextBlock');
  if(upcoming.length>0){
    var nr=upcoming[0];
    var nc=(nr.cardStyle==='large'||nr.recordKind==='anniversary')?renderHeroCard(nr,true):renderRecordCard(nr);
    nextBlock.innerHTML='<div class="card-section"><div class="card-section-head"><div class="card-section-title">'+t('nextReminder')+'</div></div>'+nc+'</div>';
  }else{nextBlock.innerHTML='';}

  // Week strip
  renderWeekStrip();

  // Recent: non-hero, non-next, up to 3
  var exIds=heroPicked.map(function(r){return r.id;});
  if(upcoming[0])exIds.push(upcoming[0].id);
  var remaining=list.filter(function(r){return exIds.indexOf(r.id)<0;});
  remaining.sort(function(a,b){return(b.updatedAt||b.createdAt)-(a.updatedAt||a.createdAt);});
  var recent=remaining.slice(0,3);
  var recentBlock=$('recentBlock');
  var rh='<div class="card-section"><div class="card-section-head"><div class="card-section-title">'+t('recentRecords')+'</div><div class="card-section-count">'+remaining.length+'</div></div>';
  if(recent.length>0){
    recent.forEach(function(r){
      if(r.cardStyle==='large'||r.recordKind==='anniversary')rh+=renderHeroCard(r,true);
      else rh+=renderRecordCard(r);
    });
  }else if(hasAnyRecord()){
    rh+='';
  }
  rh+='</div>';
  recentBlock.innerHTML=rh;
<<<<<<< HEAD
=======
  if(window.ShikeChronosWeb)ShikeChronosWeb.render(records);
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
}

/* ========== Week strip ========== */
function renderWeekStrip(){
  var ws=$('weekStrip');if(!ws)return;
  var now=new Date();
  var today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  var curWd=today.getDay();
  var start=new Date(today);start.setDate(today.getDate()-curWd);
  var wdNames=[t('sun'),t('mon'),t('tue'),t('wed'),t('thu'),t('fri'),t('sat')];
  var html='';
  var recordDates={};records.forEach(function(r){if(r.dateKey)recordDates[r.dateKey]=true;});
  for(var i=0;i<7;i++){
    var d=new Date(start);d.setDate(start.getDate()+i);
    var key=d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
    var isToday=d.getTime()===today.getTime();
    var has=recordDates[key];
    html+='<div class="ws-day'+(isToday?' today':'')+'" onclick="selectCalendarDay(new Date('+d.getFullYear()+','+d.getMonth()+','+d.getDate()+'))">'+
      '<span class="ws-dname">'+wdNames[i]+'</span>'+
      '<span class="ws-dnum">'+d.getDate()+'</span>'+
      (has?'<div class="ws-dots"><span class="ws-dot"></span></div>':'')+
    '</div>';
  }
  ws.innerHTML=html;
}

/* ========== Calendar ========== */
var calViewDate=new Date();
var calSelectedDate=null;
function renderCalendar(){
  calSelectedDate=calSelectedDate||new Date();
  var y=calViewDate.getFullYear(),m=calViewDate.getMonth();
  var firstDay=new Date(y,m,1);
  var startWd=firstDay.getDay();
  var daysInMonth=new Date(y,m+1,0).getDate();
  var prevMonthDays=new Date(y,m,0).getDate();
  var monthTitle;
  if(LANG==='en'){
    var ml=[t('jan'),t('feb'),t('mar'),t('apr'),t('may'),t('jun'),t('jul'),t('aug'),t('sep'),t('oct'),t('nov'),t('dec')];
    monthTitle=ml[m]+' '+y;
  }else monthTitle=y+' '+t('mon_fmt').replace('{m}',m+1);
  $('calMonthTitle').textContent=monthTitle;
  var recordDates={};records.forEach(function(r){if(r.dateKey)recordDates[r.dateKey]=true;});
  var grid=$('calGrid');
  var html='';
  var wkLabels=[t('sun'),t('mon'),t('tue'),t('wed'),t('thu'),t('fri'),t('sat')];
  wkLabels.forEach(function(w){html+='<div class="cal-wk">'+w+'</div>';});
  var today=new Date();today.setHours(0,0,0,0);
  // Prev month trailing
  for(var i=startWd-1;i>=0;i--){
    var d=prevMonthDays-i;
    html+='<div class="cal-cell other-month"><span>'+d+'</span></div>';
  }
  // Current month
  for(var d=1;d<=daysInMonth;d++){
    var cellDate=new Date(y,m,d);
    var key=y+'-'+pad2(m+1)+'-'+pad2(d);
    var isToday=cellDate.getTime()===today.getTime();
    var isSelected=calSelectedDate&&cellDate.getTime()===setHoursZero(calSelectedDate).getTime();
    var has=recordDates[key];
    var lunarText=settings.calendarMode==='lunar'?(solarToLunar(cellDate)||''):'';
    var holi=getHolidayInfo(cellDate);
    var sub=holi||lunarText;
    var subCls=holi?'cal-holiday':'cal-lunar';
    html+='<div class="cal-cell'+(isToday?' today':'')+(isSelected?' selected':'')+'" onclick="selectCalendarDay(new Date('+y+','+m+','+d+'))">'+
      '<span>'+d+'</span>'+
      (sub?'<span class="'+subCls+'">'+sub+'</span>':'')+
      (has?'<div class="cal-dots"><span class="cal-dot"></span></div>':'')+
    '</div>';
  }
  // Next month leading
  var totalCells=startWd+daysInMonth;
  var trailing=(7-totalCells%7)%7;
  for(var i=1;i<=trailing;i++){
    html+='<div class="cal-cell other-month"><span>'+i+'</span></div>';
  }
  grid.innerHTML=html;
  renderCalendarDay();
}
function selectCalendarDay(d){
  calSelectedDate=d;
  if(calViewDate.getMonth()!==d.getMonth()||calViewDate.getFullYear()!==d.getFullYear()){
    calViewDate=new Date(d.getFullYear(),d.getMonth(),1);
  }
  renderCalendar();
}
function renderCalendarDay(){
  var detail=$('calDayDetail');if(!detail)return;
  if(!calSelectedDate){detail.innerHTML='';return;}
  var key=calSelectedDate.getFullYear()+'-'+pad2(calSelectedDate.getMonth()+1)+'-'+pad2(calSelectedDate.getDate());
  var dayRecords=records.filter(function(r){return r.dateKey===key;});
  var holi=getHolidayInfo(calSelectedDate);
  var lunarTxt=settings.calendarMode==='lunar'?(solarToLunar(calSelectedDate)||''):'';
  var html='<div class="card-section" style="margin-top:8px;">';
  html+='<div class="card-section-head"><div class="card-section-title">'+pad2(calSelectedDate.getMonth()+1)+'月'+calSelectedDate.getDate()+'日</div>';
  html+='<div class="card-section-count">'+(holi||lunarTxt||'')+'</div></div>';
  if(dayRecords.length>0){
    dayRecords.forEach(function(r){
      if(r.cardStyle==='large'||r.recordKind==='anniversary')html+=renderHeroCard(r,true);
      else html+=renderRecordCard(r);
    });
  }else{
    html+='<div class="mini-empty">'+t('noRecordsToday')+'</div>';
  }
  html+='<div class="cal-quick-add">'+
    '<input class="form-input cal-quick-input" id="calQuickInput" placeholder="'+escHtml(t('calQuickAddPh'))+'" onkeydown="if(event.key===\'Enter\'){event.preventDefault();saveCalendarQuickAdd();}">'+
    '<button class="cal-quick-btn" onclick="saveCalendarQuickAdd()">'+t('save')+'</button>'+
  '</div>';
  html+='</div>';
  detail.innerHTML=html;
}

function dateKeyFromDate(d){
  return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());
}
function dateTextFromDate(d){
  var target=setHoursZero(d);
  var today=setHoursZero(new Date());
  var diff=Math.round((target-today)/86400000);
  if(diff===0)return t('today');
  if(diff===1)return t('tomorrow');
  if(diff===2)return t('dayAfter');
  if(LANG==='en'){
    var months=[t('jan'),t('feb'),t('mar'),t('apr'),t('may'),t('jun'),t('jul'),t('aug'),t('sep'),t('oct'),t('nov'),t('dec')];
    return months[d.getMonth()]+' '+d.getDate();
  }
  return (d.getMonth()+1)+'月'+d.getDate()+'日';
}
function hasExplicitDateInput(text){
  return /大后天|后天|明天|今天|昨天|今晚|下个月|下月|月底|月末|周|星期|\d{1,2}\s*[月\/\-]\s*\d{1,2}|(?:\d+|[一二两三四五六七八九十]+)\s*天后?|一周后|1周后|一个星期后/.test(text);
}
function saveCalendarQuickAdd(){
  var inp=$('calQuickInput');
  var text=(inp&&inp.value||'').trim();
  if(!text){showToast(t('emptyInput'),'warn');return;}
  var parsed=parseReminderText(text);
  if(!parsed||!parsed.title){showToast(t('emptyInput'),'warn');return;}
  if(calSelectedDate&&!hasExplicitDateInput(text)&&parsed.relativeMinutes===null){
    parsed.dateKey=dateKeyFromDate(calSelectedDate);
    parsed.dateText=dateTextFromDate(calSelectedDate);
  }
  saveParsedRecord(parsed,text);
  if(inp)inp.value='';
  renderCalendar();
  startCountdownTicker();
  showToast(t('saved'),'success');
}


/* ========== All page ========== */
var allFilter='all';
var allSearchQuery='';
var allSearchTimer=null;
function recordMatchesAllSearch(r,q){
  if(!q)return true;
  var kindLabel={reminder:t('reminder'),anniversary:t('anniversary'),habit:t('habit'),note:t('note')}[r.recordKind]||'';
  var text=[r.title,r.note,r.rawText,r.dateText,r.timeText,r.recordKind,kindLabel].join(' ').toLowerCase();
  return text.indexOf(q.toLowerCase())>=0;
}
function renderAll(){
  var list=records.slice().sort(function(a,b){return(b.updatedAt||b.createdAt)-(a.updatedAt||a.createdAt);});
  if(allFilter!=='all')list=list.filter(function(r){return r.recordKind===allFilter;});
  if(allSearchQuery)list=list.filter(function(r){return recordMatchesAllSearch(r,allSearchQuery);});
  $('allCount').textContent=list.length;
  var c=$('allList');
  renderTimeline();
  if(list.length===0){c.innerHTML='<div class="mini-empty">'+(allSearchQuery?t('noSearchResult'):t('emptyHint'))+'</div>';return;}
  var html='';
  list.forEach(function(r){
    if(r.cardStyle==='large'||r.recordKind==='anniversary')html+=renderHeroCard(r,true);
    else html+=renderRecordCard(r);
    html+='<div class="record-extra-actions" style="display:flex;gap:6px;margin:-4px 0 12px;justify-content:flex-end;">'+
      '<button class="cover-btn" style="flex:0 0 auto;padding:6px 12px;font-size:12px;" onclick="toggleCardStyle(\''+r.id+'\')">'+(r.cardStyle==='large'?t('cardNormal'):t('cardLarge'))+'</button>'+
      '<button class="cover-btn" style="flex:0 0 auto;padding:6px 12px;font-size:12px;" onclick="togglePin(\''+r.id+'\')">'+(r.pinned?t('unpin'):t('setPin'))+'</button>'+
      '<button class="cover-btn" style="flex:0 0 auto;padding:6px 12px;font-size:12px;" onclick="openEditDrawer(\''+r.id+'\')">'+t('edit')+'</button>'+
      '<button class="cover-btn" style="flex:0 0 auto;padding:6px 12px;font-size:12px;color:#b5433a;" onclick="deleteRecord(\''+r.id+'\')">'+t('delete')+'</button>'+
    '</div>';
  });
  c.innerHTML=html;
}

/* ========== Import page ========== */
var importDrafts=[];
function getBatchCaptureLines(text){
  return String(text||'').split(/\r?\n+/).map(function(s){return s.trim();}).filter(Boolean);
}
function shouldUseBatchCapture(text){
  return getBatchCaptureLines(text).length>=2;
}
function getBatchDraftKey(line){
  return String(line||'').replace(/\s+/g,' ').trim().toLowerCase();
}
function getRecordDuplicateKey(record){
  record=record||{};
  return [
    getBatchDraftKey(record.title||record.rawText||record.sourceText||''),
    record.dateKey||'',
    record.timeText||'',
    record.repeat||'none',
    record.recordKind||''
  ].join('|');
}
function isDraftExistingDuplicate(draft){
  if(!draft||!draft.parsed)return false;
  var key=getRecordDuplicateKey(draft.parsed);
  return records.some(function(record){return getRecordDuplicateKey(record)===key;});
}
function prepareBatchCaptureDrafts(text){
  var seen={};
  var drafts=[];
  getBatchCaptureLines(text).forEach(function(line){
    var key=getBatchDraftKey(line);
    if(!key||seen[key])return;
    seen[key]=true;
    var parsed=normalizeCapturePreviewParsed(line,parseReminderText(line));
    if(parsed&&parsed.title)drafts.push({text:line,parsed:parsed});
  });
  return drafts;
}
function captureBatchFromInput(text){
  if(!shouldUseBatchCapture(text))return false;
  var drafts=prepareBatchCaptureDrafts(text);
  if(!drafts.length)return false;
  importDrafts=drafts;
  pendingParsePreview=null;
  var inp=$('quickInput');
  if(inp){inp.value='';autoResizeInput();}
  renderParsePreview();
  switchPage('import');
  renderImport();
  showToast('已整理 '+drafts.length+' 条草稿','success');
  return true;
}
function renderImport(){
  // Render existing drafts if any
  renderDrafts();
  renderLaterInbox();
}
function renderDrafts(){
  var c=$('importDraftList');
  if(importDrafts.length===0){c.innerHTML='';return;}
  var html='<div class="card-section-title" style="font-size:14px;margin:14px 0 8px;">识别到 '+importDrafts.length+' 条</div>';
  importDrafts.forEach(function(d,i){
    var parsed=d.parsed;
    html+='<div class="draft-item"><div class="draft-item-title">'+escHtml(parsed.title||d.text)+'</div>';
    html+='<div class="draft-item-meta">';
    if(parsed.dateText)html+='<span class="draft-chip">'+escHtml(parsed.dateText)+'</span>';
    if(parsed.timeText)html+='<span class="draft-chip">'+escHtml(parsed.timeText)+'</span>';
    html+='<span class="draft-chip">'+({reminder:t('reminder'),anniversary:t('anniversary'),habit:t('habit'),note:t('note')}[parsed.recordKind]||'')+'</span>';
    if(isDraftExistingDuplicate(d))html+='<span class="draft-chip">'+escHtml(t('draftExisting'))+'</span>';
    html+='</div><div class="draft-item-actions"><button class="draft-save" onclick="saveDraft('+i+')">'+t('save')+'</button><button class="draft-discard" onclick="editDraft('+i+')">修改</button><button class="draft-discard" onclick="discardDraft('+i+')">'+t('cancel')+'</button></div></div>';
  });
  html+='<button class="draft-save-all" onclick="saveAllDrafts()">'+escHtml(t('batchSaveAll'))+'</button>';
  c.innerHTML=html;
}
function saveDraft(i){
  var d=importDrafts[i];if(!d)return;
  if(isDraftExistingDuplicate(d)){importDrafts.splice(i,1);renderDrafts();showToast(t('draftDuplicateSkipped'),'warn');return;}
  saveParsedRecord(d.parsed,d.text);
  importDrafts.splice(i,1);renderDrafts();showToast(t('saved'),'success');
}
function discardDraft(i){importDrafts.splice(i,1);renderDrafts();}
function editDraft(i){
  var d=importDrafts[i];if(!d)return;
  importDrafts.splice(i,1);
  renderDrafts();
  switchPage('home');
  var inp=$('quickInput');
  if(inp){
    inp.value=d.text||((d.parsed&&d.parsed.rawText)||'');
    autoResizeInput();
    inp.focus();
    if(isParsePreviewEnabled())showParsePreview(inp.value||'');
  }
}
function saveAllDrafts(){
  var saved=0,skipped=0;
  importDrafts.forEach(function(d){
    if(isDraftExistingDuplicate(d)){skipped++;return;}
    saveParsedRecord(d.parsed,d.text);saved++;
  });
  importDrafts=[];renderDrafts();
  var msg=saved&&skipped?tf('batchSavedResult',{saved:saved,skipped:skipped}):(saved?tf('batchSavedOnly',{saved:saved}):(skipped?tf('batchSkippedOnly',{skipped:skipped}):t('saved')));
  showToast(msg,saved?'success':'warn');
  switchPage('home');
}
function hasUnsavedWork(){
  var quick=$('quickInput');
  var importText=$('importTextInput');
  return !!(
    (quick&&(quick.value||'').trim())||
    (importText&&(importText.value||'').trim())||
    (importDrafts&&importDrafts.length)||
<<<<<<< HEAD
    pendingParsePreview
=======
    pendingParsePreview||
    (window.ShikeChronosWeb&&window.ShikeChronosWeb.hasPendingDrafts())
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  );
}
function registerUnsavedWorkGuard(){
  window.addEventListener('beforeunload',function(e){
    if(!hasUnsavedWork())return;
    e.preventDefault();
    e.returnValue='';
    return '';
  });
}

/* ========== My page ========== */
function renderMy(){
  // Greeting
  var days=getUsageDays();
  var name=settings.username||'';
  var greet=name?tf('userDaysText',{name:escHtml(name),n:days}):tf('daysText',{n:days});
  $('myGreeting').textContent=greet;
  $('myDays').textContent=new Date().getFullYear()+'年'+(new Date().getMonth()+1)+'月'+new Date().getDate()+'日';
  // Stats
  var stat=records.length;
  var rem=records.filter(function(r){return r.recordKind==='reminder';}).length;
  var ann=records.filter(function(r){return r.recordKind==='anniversary';}).length;
  var hab=records.filter(function(r){return r.recordKind==='habit';}).length;
  $('myStats').innerHTML=
    '<div class="stat-card"><div class="stat-num">'+stat+'</div><div class="stat-label">'+t('allRecords')+'</div></div>'+
    '<div class="stat-card"><div class="stat-num">'+rem+'</div><div class="stat-label">'+t('reminder')+'</div></div>'+
    '<div class="stat-card"><div class="stat-num">'+ann+'</div><div class="stat-label">'+t('anniversary')+'</div></div>'+
    '<div class="stat-card"><div class="stat-num">'+hab+'</div><div class="stat-label">'+t('habit')+'</div></div>';
  // Version
  $('appVersion').textContent=APP_VERSION;
  $('appUpdatedAt').textContent=APP_UPDATED_AT;
  if($('safetyRecordCount'))$('safetyRecordCount').textContent=stat;
  if($('safetyExportableCount'))$('safetyExportableCount').textContent=countExportableRecords();
  if($('safetyUndatedCount'))$('safetyUndatedCount').textContent=countUndatedRecords();
  if($('safetyLastBackup'))$('safetyLastBackup').textContent=getLastBackupText();
  var storageStatus=window.ShikeLocalFirst?ShikeLocalFirst.getStatus():{mode:'legacy-fallback',quarantineCount:0};
<<<<<<< HEAD
  if($('storageEngineStatus'))$('storageEngineStatus').textContent=storageStatus.mode==='indexeddb'?t('indexedDbMode'):t('legacyFallbackMode');
  if($('quarantineCount'))$('quarantineCount').textContent=storageStatus.quarantineCount||0;
  if($('safetyStatusHint'))$('safetyStatusHint').textContent=(stat>=5&&!localStorage.getItem(LAST_BACKUP_KEY))?t('backupSuggested'):t('backupLooksOk');
=======
  var _ses=$('storageEngineStatus');if(_ses)_ses.textContent=storageStatus.mode==='indexeddb'?t('indexedDbMode'):t('legacyFallbackMode');
  var _qc=$('quarantineCount');if(_qc)_qc.textContent=storageStatus.quarantineCount||0;
  if($('safetyStatusHint'))$('safetyStatusHint').textContent=(stat>=5&&!localStorage.getItem(LAST_BACKUP_KEY))?t('backupSuggested'):t('backupLooksOk');
  updatePermStatus();
  if(window.ShikeTrashRepository&&typeof window.ShikeTrashRepository.renderList==='function'){
    try{window.ShikeTrashRepository.renderList();}catch(e){}
  }else if(typeof renderTrashList==='function'){
    try{renderTrashList();}catch(e){}
  }
  if(window.ShikeSnapshotService&&typeof window.ShikeSnapshotService.renderList==='function'){
    try{window.ShikeSnapshotService.renderList();}catch(e){}
  }else if(typeof renderSnapshotList==='function'){
    try{renderSnapshotList();}catch(e){}
  }
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  // Username input
  $('usernameInput').value=settings.username||'';
  // Theme
  document.querySelectorAll('.theme-dot').forEach(function(el){
    el.classList.toggle('active',el.dataset.theme===settings.theme);
  });
  // Lang
  document.querySelectorAll('#langGroup .radio-chip').forEach(function(el){
    el.classList.toggle('active',el.dataset.lang===settings.language);
  });
  // Cal mode
  document.querySelectorAll('#calModeGroup .radio-chip').forEach(function(el){
    el.classList.toggle('active',el.dataset.calmode===settings.calendarMode);
  });
  // Weather switch
  $('weatherSwitch').classList.toggle('on',!!settings.weatherEnabled);
  // Notifications
  updateNotifyStatus();
<<<<<<< HEAD
=======
  if(window.ShikeChronosWeb)ShikeChronosWeb.renderReviews();
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
}
function getUsageDays(){
  if(!settings.firstVisitAt)return 1;
  var first=new Date(settings.firstVisitAt);first.setHours(0,0,0,0);
  var now=new Date();now.setHours(0,0,0,0);
  return Math.floor((now-first)/86400000)+1;
}
function updateNotifyStatus(){
  var s=$('notifyStatus'),item=$('notifyPermItem');
  if(!s||!item)return;
  if(!('Notification' in window)){s.textContent=t('notifyUnsupported');item.style.display='none';return;}
  if(Notification.permission==='granted'){s.textContent=t('notifyEnabled');item.style.display='none';}
  else if(Notification.permission==='denied'){s.textContent=t('notifyDenied');item.style.display='none';}
  else{s.textContent=t('notifyOff');item.style.display='flex';}
}
function copyFeedbackEmail(){
  var email='308138249@qq.com';
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(email).then(function(){showToast(t('feedbackCopied'),'success');})
      .catch(function(){window.location.href='mailto:'+email;});
  }else{
    window.location.href='mailto:'+email;
  }
}
function copyFeedbackTemplate(){
  var text=t('feedbackTemplateText');
  function done(){showToast(t('feedbackTemplateCopied'),'success');}
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done).catch(function(){fallbackCopyRecordText(text);done();});
  }else{
    fallbackCopyRecordText(text);done();
  }
}
function openFeatureHubAction(action){
  if(action==='demo'){jumpToMySection('experienceExampleSection');return;}
  if(action==='route'){
<<<<<<< HEAD
    jumpToMySection('demoRouteSection');
    var sec=$('demoRouteSection');
=======
    jumpToMySection('reminderSection');
    var sec=$('reminderSection');
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
    var details=sec&&sec.querySelector?sec.querySelector('details'):null;
    if(details)details.open=true;
    return;
  }
  if(action==='updates'){
    jumpToMySection('releaseCenterSection');
    var detail=$('releaseCenterDetails');
    if(detail)detail.open=true;
    showReleaseNotes(true);
    return;
  }
<<<<<<< HEAD
  if(action==='safety'){jumpToMySection('dataSafetySection');return;}
=======
  if(action==='safety'){jumpToMySection('dataBackupSection');return;}
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  if(action==='calendar'){jumpToMySection('calendarExportSection');return;}
  if(action==='feedback'){jumpToMySection('feedbackSection');return;}
  if(action==='future'){jumpToMySection('futurePlanSection');return;}
}

var deferredInstallPrompt=null;
window.addEventListener('beforeinstallprompt',function(e){
  e.preventDefault();
  deferredInstallPrompt=e;
  var item=$('installPwaItem');
  if(item)item.style.display='flex';
});

var notifyTimer=null;
function startNotificationChecker(){
  if(notifyTimer)clearInterval(notifyTimer);
  checkDueNotifications();
  notifyTimer=setInterval(checkDueNotifications,60000);
}
function checkDueNotifications(){
  if(!('Notification' in window)||Notification.permission!=='granted')return;
  var now=Date.now();
  var changed=false;
  records.forEach(function(r){
    if(r.recordKind==='anniversary')return;
    var d=getRecordTargetDateTime(r);
    if(!d||!r.timeText)return;
    var target=d.getTime();
    if(target>now||now-target>120000)return;
    if(r.notifiedAt&&r.notifiedAt>=target)return;
    var body=[r.dateText,r.timeText].filter(Boolean).join(' ')||t('notifyDueBody');
    try{new Notification(r.title||t('appName'),{body:body});}
    catch(e){showToast((r.title||'')+' '+t('notifyDueBody'),'warn');}
    r.notifiedAt=now;
    changed=true;
  });
  if(changed)saveRecords();
}

/* ========== Weather ========== */
var weatherTimer=null;
function setWeatherEnabled(enabled){
  settings.weatherEnabled=enabled;saveSettings(settings);
  document.body.classList.toggle('weather-on',enabled);
  if(enabled){
    fetchWeather();
  }else{
    $('weatherCard').classList.remove('show');
  }
}
function fetchWeather(){
  var now=Date.now();
  // Cache for 30 min
  if(settings.weatherCache&&(now-settings.weatherCacheAt<30*60*1000)){
    renderWeather(settings.weatherCache);return;
  }
  if(!navigator.geolocation){
    renderWeatherError(t('weatherNoSupport'));return;
  }
  // Don't re-prompt if denied recently
  if(settings.locationDeniedUntil&&now<settings.locationDeniedUntil){
    renderWeatherError(t('weatherDenied'));return;
  }
  navigator.geolocation.getCurrentPosition(function(pos){
    var lat=pos.coords.latitude,lon=pos.coords.longitude;
    fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m,weather_code&timezone=auto')
      .then(function(r){return r.json();})
      .then(function(data){
        if(data&&data.current){
          var info={temp:Math.round(data.current.temperature_2m),code:data.current.weather_code};
          settings.weatherCache=info;settings.weatherCacheAt=now;saveSettings(settings);
          renderWeather(info);
        }else renderWeatherError(t('weatherUnavail'));
      }).catch(function(){renderWeatherError(t('weatherUnavail'));});
  },function(err){
    if(err&&err.code===1){settings.locationDeniedUntil=now+24*3600*1000;saveSettings(settings);renderWeatherError(t('weatherDenied'));}
    else renderWeatherError(t('weatherUnavail'));
  },{timeout:8000});
}
function weatherCodeToIcon(code){
  if(!code)return'☀';
  if(code<=1)return'☀';
  if(code<=3)return'⛅';
  if(code<=48)return'☁';
  if(code<=67)return'🌧';
  if(code<=77)return'❄';
  if(code<=82)return'🌧';
  return'⛈';
}
function weatherCodeToText(code){
  if(!code)return'';
  if(code<=1)return'晴';
  if(code<=3)return'多云';
  if(code<=48)return'阴';
  if(code<=67)return'雨';
  if(code<=77)return'雪';
  return'雷雨';
}
function renderWeather(info){
  var card=$('weatherCard');
  card.classList.add('show');
  $('weatherIcon').textContent=weatherCodeToIcon(info.code);
  $('weatherTemp').textContent=info.temp+'°';
  $('weatherDesc').textContent=weatherCodeToText(info.code);
}
function renderWeatherError(msg){
  var card=$('weatherCard');
  card.classList.add('show');
  $('weatherIcon').textContent='!';
  $('weatherTemp').textContent='--';
  $('weatherDesc').textContent=msg;
}

/* ========== CRUD ========== */
var inputSaveLocked=false;
function saveParsedRecord(parsed,rawText){
  var item={
    id:genId(),title:parsed.title,
    dateText:parsed.dateText,dateKey:parsed.dateKey,
    timeText:parsed.timeText,locationText:'',note:'',
    repeat:parsed.repeat||'none',repeatText:parsed.repeatText||repeatLabel(parsed.repeat||'none'),
    monthEnd:!!parsed.monthEnd,
    rawText:rawText||parsed.title,
    archived:false,createdAt:Date.now(),updatedAt:Date.now(),ts:Date.now(),
    recordKind:parsed.recordKind,recordState:'active',notifyMode:'none',notifiedAt:null,
    coverImage:null,coverPreset:0,subtitle:'',pinned:false,
    cardStyle:parsed.recordKind==='anniversary'?'large':'normal',
    accentColor:'',displayMode:'auto',
    relativeMinutes:parsed.relativeMinutes,
    sourceText:rawText||parsed.rawText||parsed.title
  };
  item=normalizeRecord(item);
  records.unshift(item);
<<<<<<< HEAD
  saveRecords();
=======
  if(saveRecords()===false){
    records=records.filter(function(record){return record.id!==item.id;});
    return null;
  }
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  return item;
}
function saveFromInput(){
  if(inputSaveLocked)return;
  var inp=$('quickInput');
  var text=(inp.value||'').trim();
  if(!text){showToast(t('emptyInput'),'warn');return;}
<<<<<<< HEAD
=======
  if(window.ShikeChronosWeb&&ShikeChronosWeb.captureIfNeeded(text))return;
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  if(captureBatchFromInput(text))return;
  if(isParsePreviewEnabled()){
    if(isPendingPreviewForText(text)){confirmParsePreview();return;}
    if(!showParsePreview(text)){showToast(t('emptyInput'),'warn');}
    return;
  }
  directSaveFromInput();
}
function deleteRecord(id){
  var r=records.find(function(x){return x.id===id;});
  if(!r)return;
  showConfirm(t('delete'),'确定删除「'+r.title+'」？',t('delete'),t('cancel'),function(){
<<<<<<< HEAD
    records=records.filter(function(x){return x.id!==id;});
    saveRecords();closeDrawer();
    renderCurrent();showToast(t('deleted'),'success');
=======
    var trashEntry=null;var graphMoved=false;
    var trashPromise=window.ShikeTrashRepository?ShikeTrashRepository.softDelete(r,'user_delete',currentPage):Promise.reject(new Error('trash_unavailable'));
    trashPromise.then(function(entry){
      trashEntry=entry;
      if(!window.ShikeChronosWeb)return false;
      return ShikeChronosWeb.tombstoneRecord(id).then(function(result){graphMoved=!!result;return result;});
    }).then(function(){
      records=records.filter(function(x){return x.id!==id;});
      if(!saveRecords())throw new Error('delete_save_failed');
      closeDrawer();renderCurrent();showToast(t('deleted'),'success');
    }).catch(function(){
      if(!records.some(function(item){return item.id===id;})){records.unshift(r);saveRecords();}
      if(graphMoved&&window.ShikeChronosWeb)ShikeChronosWeb.restoreRecord(id).catch(function(){});
      if(trashEntry&&window.ShikeTrashRepository)ShikeTrashRepository.restore(trashEntry.id).catch(function(){});
      showToast('删除未完成，原记录已保留。','error');
    });
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  });
}
function togglePin(id){
  var r=records.find(function(x){return x.id===id;});
  if(!r)return;
  r.pinned=!r.pinned;r.updatedAt=Date.now();
  saveRecords();renderCurrent();
  showToast(r.pinned?t('setPin'):t('unpin'),'success');
}
function toggleCardStyle(id){
  var r=records.find(function(x){return x.id===id;});
  if(!r)return;
  r.cardStyle=r.cardStyle==='large'?'normal':'large';
  r.updatedAt=Date.now();
  saveRecords();renderCurrent();
}
function renderCurrent(){
  if(currentPage==='home')renderHome();
  else if(currentPage==='all')renderAll();
  else if(currentPage==='calendar')renderCalendar();
  else if(currentPage==='my')renderMy();
  renderTimeSprite();
}

/* ========== Detail ========== */
function openDetail(id){
  var r=records.find(function(x){return x.id===id;});
  if(!r)return;
  // If large card, just show as hero in drawer body
  var cd=formatLiveCountdown(r);
  var body='';
  if(r.cardStyle==='large'||r.recordKind==='anniversary'){
    body='<div style="margin-bottom:14px;">'+renderHeroCard(r,false)+'</div>';
  }
  body+='<div>'+
    '<div class="detail-row"><span class="detail-label">标题</span><span class="detail-value">'+escHtml(r.title)+'</span></div>'+
    (r.dateText?'<div class="detail-row"><span class="detail-label">日期</span><span class="detail-value">'+escHtml(r.dateText)+'</span></div>':'')+
    (r.timeText?'<div class="detail-row"><span class="detail-label">时间</span><span class="detail-value">'+escHtml(r.timeText)+'</span></div>':'')+
    (cd?'<div class="detail-row"><span class="detail-label">倒计时</span><span class="detail-value">'+escHtml(cd.text)+'</span></div>':'')+
    '<div class="detail-row"><span class="detail-label">类型</span><span class="detail-value">'+({reminder:t('reminder'),anniversary:t('anniversary'),habit:t('habit'),note:t('note')}[r.recordKind])+'</span></div>'+
    (r.repeat&&r.repeat!=='none'?'<div class="detail-row"><span class="detail-label">重复</span><span class="detail-value">'+escHtml(repeatLabel(r.repeat))+'</span></div>':'')+
    '<div class="detail-row"><span class="detail-label">卡片样式</span><span class="detail-value">'+(r.cardStyle==='large'?t('cardLarge'):t('cardNormal'))+'</span></div>'+
    '<div class="detail-row"><span class="detail-label">置顶</span><span class="detail-value">'+(r.pinned?'是':'否')+'</span></div>'+
    '<div class="detail-row"><span class="detail-label">记录时间</span><span class="detail-value">'+new Date(r.createdAt).toLocaleDateString()+'</span></div>'+
  '</div>';
  var footer=(r.recordKind==='anniversary'?'<button class="btn-secondary" onclick="exportAnniversaryCardPng(\''+id+'\')">'+t('saveCardImage')+'</button>':'')+
    (r.dateKey?'<button class="btn-secondary" onclick="exportRecordIcsFile(\''+id+'\')">'+t('exportRecordIcs')+'</button>':'')+
    '<button class="btn-cancel" onclick="closeDrawer()">'+t('close')+'</button>'+
    '<button class="btn-secondary" onclick="togglePin(\''+id+'\');openDetail(\''+id+'\');">'+(r.pinned?t('unpin'):t('setPin'))+'</button>'+
    '<button class="btn-primary" onclick="openEditDrawer(\''+id+'\')">'+t('edit')+'</button>';
  openDrawer(r.title,body,footer);
}

/* ========== Edit Drawer ========== */
var _editId,_editTitle,_editDateText,_editTimeText,_editKind,_editRepeat,_editNote;
var _editCoverPreset,_editCoverImage,_editSubtitle,_editPinned,_editCardStyle;
function openEditDrawer(id){
  var r=id?records.find(function(x){return x.id===id;}):null;
  _editId=id||null;
  _editTitle=r?r.title:'';
  _editDateText=r?r.dateText:'';
  _editTimeText=r?r.timeText:'';
  _editKind=r?r.recordKind:'reminder';
  _editRepeat=r?r.repeat:'none';
  _editNote=r?r.note:'';
  _editCoverPreset=r?parseInt(r.coverPreset)||0:0;
  _editCoverImage=r?r.coverImage||null:null;
  _editSubtitle=r?r.subtitle||'':'';
  _editPinned=r?!!r.pinned:false;
  _editCardStyle=r?r.cardStyle:((_editKind==='anniversary')?'large':'normal');

  var kindOptions=[['reminder',t('reminder')],['anniversary',t('anniversary')],['habit',t('habit')],['note',t('note')]];
  var repeatOptions=[['none','不重复'],['daily','每天'],['weekly','每周'],['monthly','每月'],['yearly','每年']];

  var body='<div class="form-group"><label class="form-label">标题</label>'+
    '<input class="form-input" id="editTitle" value="'+escHtml(_editTitle)+'"></div>'+
    '<div class="form-row">'+
    '<div class="form-group"><label class="form-label">日期</label><input class="form-input" id="editDateText" value="'+escHtml(_editDateText)+'" placeholder="今天/明天/7月8日"></div>'+
    '<div class="form-group"><label class="form-label">时间</label><input class="form-input" id="editTimeText" value="'+escHtml(_editTimeText)+'" placeholder="15:00"></div>'+
    '</div>'+
    '<div class="form-group"><label class="form-label">类型</label><div class="radio-group" id="editKindGroup">'+
      kindOptions.map(function(k){return '<span class="radio-chip '+(_editKind===k[0]?'active':'')+'" data-kind="'+k[0]+'">'+k[1]+'</span>';}).join('')+
    '</div></div>'+
    '<div class="form-group"><label class="form-label">重复</label><div class="radio-group" id="editRepeatGroup">'+
      repeatOptions.map(function(k){return '<span class="radio-chip '+(_editRepeat===k[0]?'active':'')+'" data-repeat="'+k[0]+'">'+k[1]+'</span>';}).join('')+
    '</div></div>'+
    '<div class="form-group"><label class="form-label">备注</label>'+
      '<input class="form-input" id="editNote" value="'+escHtml(_editNote)+'" placeholder="选填"></div>'+
    renderCoverPicker({coverImage:_editCoverImage,coverPreset:_editCoverPreset})+
    '<div class="form-group"><div class="form-switch-row"><span class="form-switch-label">'+t('cardLarge')+'</span><div class="my-switch '+(_editCardStyle==='large'?'on':'')+'" id="editCardStyleSwitch"></div></div></div>'+
    '<div class="form-group"><div class="form-switch-row"><span class="form-switch-label">'+t('setPin')+'</span><div class="my-switch '+(_editPinned?'on':'')+'" id="editPinSwitch"></div></div></div>'+
    '<div class="form-group"><label class="form-label">副标题</label><input class="form-input" id="editSubtitle" value="'+escHtml(_editSubtitle)+'" placeholder="选填"></div>';
  var footer='<button class="btn-cancel" onclick="closeDrawer()">'+t('cancel')+'</button>'+
    (_editId?'<button class="btn-danger" onclick="deleteRecord(\''+_editId+'\')">'+t('delete')+'</button>':'')+
    '<button class="btn-primary" onclick="saveEdit()">'+t('save')+'</button>';
  openDrawer(_editId?t('edit'):t('save'),body,footer);

  setTimeout(function(){
    // Bind kind
    var kg=$('editKindGroup');if(kg)kg.querySelectorAll('.radio-chip').forEach(function(c){
      c.addEventListener('click',function(){
        _editKind=c.dataset.kind;
        kg.querySelectorAll('.radio-chip').forEach(function(x){x.classList.remove('active');});
        c.classList.add('active');
      });
    });
    var rg=$('editRepeatGroup');if(rg)rg.querySelectorAll('.radio-chip').forEach(function(c){
      c.addEventListener('click',function(){
        _editRepeat=c.dataset.repeat;
        rg.querySelectorAll('.radio-chip').forEach(function(x){x.classList.remove('active');});
        c.classList.add('active');
      });
    });
    var psw=$('editPinSwitch');if(psw)psw.addEventListener('click',function(){
      _editPinned=!_editPinned;psw.classList.toggle('on',_editPinned);
    });
    var cssw=$('editCardStyleSwitch');if(cssw)cssw.addEventListener('click',function(){
      _editCardStyle=_editCardStyle==='large'?'normal':'large';cssw.classList.toggle('on',_editCardStyle==='large');
    });
    bindCoverPicker(_editId);
  },50);
}
function saveEdit(){
  var titleEl=$('editTitle'),dateEl=$('editDateText'),timeEl=$('editTimeText'),noteEl=$('editNote'),subEl=$('editSubtitle');
  var title=(titleEl.value||'').trim();
  if(!title){showToast(t('emptyInput'),'warn');return;}
  var dateText=(dateEl.value||'').trim();
  var timeText=(timeEl.value||'').trim();
  var note=(noteEl.value||'').trim();
  var subtitle=(subEl.value||'').trim();
  var dateKey='';
  if(dateText){
    var tmp=parseReminderText(title+' '+dateText+' '+timeText);
    dateKey=tmp.dateKey;
    if(!dateKey&&dateText==='今天'){var td=new Date();dateKey=td.getFullYear()+'-'+pad2(td.getMonth()+1)+'-'+pad2(td.getDate());}
    if(!dateKey&&dateText==='明天'){var td=new Date();td.setDate(td.getDate()+1);dateKey=td.getFullYear()+'-'+pad2(td.getMonth()+1)+'-'+pad2(td.getDate());}
    if(!dateKey&&dateText==='后天'){var td=new Date();td.setDate(td.getDate()+2);dateKey=td.getFullYear()+'-'+pad2(td.getMonth()+1)+'-'+pad2(td.getDate());}
  }
  if(_editId){
    var idx=records.findIndex(function(x){return x.id===_editId;});
    if(idx>=0){
      records[idx].title=title;records[idx].dateText=dateText;records[idx].dateKey=dateKey;
      records[idx].timeText=timeText;records[idx].note=note;records[idx].recordKind=_editKind;
      records[idx].repeat=_editRepeat;records[idx].repeatText=repeatLabel(_editRepeat);
      records[idx].subtitle=subtitle;records[idx].coverImage=_editCoverImage;records[idx].coverPreset=_editCoverPreset;
      records[idx].pinned=_editPinned;records[idx].cardStyle=_editCardStyle;
      records[idx].updatedAt=Date.now();
      records[idx]=normalizeRecord(records[idx]);
    }
  }else{
    var item={id:genId(),title:title,dateText:dateText,dateKey:dateKey,timeText:timeText,note:note,
      repeat:_editRepeat,repeatText:repeatLabel(_editRepeat),rawText:title,
      archived:false,createdAt:Date.now(),updatedAt:Date.now(),ts:Date.now(),
      recordKind:_editKind,recordState:'active',notifyMode:'none',notifiedAt:null,
      coverImage:_editCoverImage,coverPreset:_editCoverPreset,subtitle:subtitle,pinned:_editPinned,
      cardStyle:_editCardStyle,accentColor:'',displayMode:'auto'};
    records.unshift(normalizeRecord(item));
  }
  saveRecords();closeDrawer();renderCurrent();showToast(t('saved'),'success');
}

/* ========== Cover picker ========== */
function renderCoverPicker(state){
  var html='<div class="cover-picker"><label class="form-label">'+t('setBg')+'</label>';
  html+='<div class="cover-presets">';
  for(var i=0;i<6;i++){
    html+='<div class="cover-preset p'+i+(state.coverPreset===i&&!state.coverImage?' active':'')+'" data-preset="'+i+'"></div>';
  }
  html+='</div><div class="cover-actions">';
  html+='<label class="cover-btn" style="cursor:pointer;">'+t('coverUpload')+'<input type="file" accept="image/*" id="coverUpload" style="display:none"></label>';
  html+='<button class="cover-btn" id="coverRemove">'+t('coverRemove')+'</button>';
  html+='</div></div>';
  return html;
}
function bindCoverPicker(){
  // Presets
  document.querySelectorAll('.cover-preset').forEach(function(el){
    el.addEventListener('click',function(){
      _editCoverPreset=parseInt(el.dataset.preset)||0;
      _editCoverImage=null;
      document.querySelectorAll('.cover-preset').forEach(function(x){x.classList.remove('active');});
      el.classList.add('active');
    });
  });
  var up=$('coverUpload');if(up){
    up.addEventListener('change',function(e){
      var f=e.target.files&&e.target.files[0];if(!f)return;
      if(!/^image\//.test(f.type||'')){showToast('请选择图片文件','warn');up.value='';return;}
      if(f.size>5*1024*1024){showToast('图片较大，已压缩','warn');}
      var reader=new FileReader();
      reader.onload=function(ev){
        var img=new Image();
        img.onload=function(){
          var canvas=document.createElement('canvas');
          var maxW=800;var scale=Math.min(1,maxW/img.width);
          canvas.width=img.width*scale;canvas.height=img.height*scale;
          var ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);
          _editCoverImage=canvas.toDataURL('image/jpeg',0.7);
          _editCoverPreset=0;
          document.querySelectorAll('.cover-preset').forEach(function(x){x.classList.remove('active');});
          showToast('背景已设置','success');
        };
        img.onerror=function(){showToast('图片读取失败','error');up.value='';};
        img.src=ev.target.result;
      };
      reader.onerror=function(){showToast('图片读取失败','error');up.value='';};
      reader.readAsDataURL(f);
    });
  }
  var rm=$('coverRemove');if(rm)rm.addEventListener('click',function(){
    _editCoverImage=null;_editCoverPreset=0;
    document.querySelectorAll('.cover-preset').forEach(function(x,i){x.classList.toggle('active',i===0);});
  });
}

/* ========== Drawer helpers ========== */
function openDrawer(title,body,footer){
  $('drawerTitle').textContent=title;
  $('drawerBody').innerHTML=body||'';
  $('drawerFooter').innerHTML=footer||'';
  $('drawerMask').classList.add('show');
  $('drawer').classList.add('show');
  setTimeout(function(){
    $('drawerMask').onclick=function(e){if(e.target===$('drawerMask'))closeDrawer();};
  },50);
}
function closeDrawer(){
  $('drawerMask').classList.remove('show');
  $('drawer').classList.remove('show');
}

/* ========== Voice ========== */
var voiceRecognition=null;
var voiceState='idle';
var VOICE_IDLE='idle',VOICE_STARTING='starting',VOICE_LISTENING='listening',VOICE_PROCESSING='processing',VOICE_ERROR='error',VOICE_UNSUPPORTED='unsupported';
function setVoiceState(state,optMsg){
  voiceState=state;
  var btn=$('voiceButton'),statusEl=$('voiceStatus');
  if(!btn||!statusEl)return;
  btn.classList.remove('listening','hidden');
  statusEl.classList.remove('listening');statusEl.textContent='';
  switch(state){
    case VOICE_IDLE:btn.disabled=false;break;
    case VOICE_STARTING:
      btn.disabled=false;btn.classList.add('listening');
      statusEl.classList.add('listening');statusEl.textContent=optMsg||'正在启动麦克风...';break;
    case VOICE_LISTENING:
      btn.disabled=false;btn.classList.add('listening');
      statusEl.classList.add('listening');statusEl.textContent=optMsg||t('voiceListening');break;
    case VOICE_PROCESSING:
      btn.disabled=false;statusEl.textContent=optMsg||t('voiceProcessing');break;
    case VOICE_ERROR:
      btn.disabled=false;statusEl.textContent=optMsg||'';break;
    case VOICE_UNSUPPORTED:
      btn.classList.add('hidden');
      if(isWeChat())statusEl.textContent=t('wechatVoiceHint');
      else statusEl.textContent='当前浏览器不支持语音输入，可用文字记录';
      break;
  }
}
function initVoiceButton(){
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(isWeChat()||!SR){setVoiceState(VOICE_UNSUPPORTED);return;}
  var btn=$('voiceButton');btn.classList.remove('hidden');
  btn.addEventListener('click',function(){
    if(voiceState===VOICE_LISTENING||voiceState===VOICE_STARTING){
      if(voiceRecognition){try{voiceRecognition.stop();}catch(e){}}
      setVoiceState(VOICE_IDLE);return;
    }
    try{
      if(voiceRecognition){try{voiceRecognition.abort();}catch(e){}voiceRecognition=null;}
      setVoiceState(VOICE_STARTING);
      var rec=new SR();
      rec.lang=navigator.language||'zh-CN';rec.interimResults=false;rec.maxAlternatives=1;
      rec.onstart=function(){setVoiceState(VOICE_LISTENING);};
      rec.onresult=function(e){
        setVoiceState(VOICE_PROCESSING);
        var text='';
        for(var i=0;i<e.results.length;i++){if(e.results[i][0])text+=e.results[i][0].transcript;}
        var inp=$('quickInput');
        inp.value=(inp.value?inp.value+' ':'')+text;
        autoResizeInput();inp.focus();
        setTimeout(function(){setVoiceState(VOICE_IDLE);},500);
      };
      rec.onerror=function(e){
        if(e.error==='not-allowed'||e.error==='service-not-allowed'){
          showToast('请允许麦克风权限','error');
        }
        setVoiceState(VOICE_ERROR);
        setTimeout(function(){setVoiceState(VOICE_IDLE);},1500);
      };
      rec.onend=function(){
        if(voiceState===VOICE_LISTENING||voiceState===VOICE_STARTING)setVoiceState(VOICE_IDLE);
      };
      voiceRecognition=rec;rec.start();
    }catch(e){setVoiceState(VOICE_ERROR);setTimeout(function(){setVoiceState(VOICE_IDLE);},1500);}
  });
  setVoiceState(VOICE_IDLE);
}

/* ========== Opening animation ========== */
function shouldShowOpening(){
  return !settings.openingSeen;
}
function markOpeningSeen(){settings.openingSeen=true;saveSettings(settings);}
function showOpening(){
  var op=$('opening');op.classList.add('show');op.classList.remove('hide');
  setTimeout(function(){hideOpening();},1800);
}
function hideOpening(){
  var op=$('opening');
  op.classList.add('hide');op.classList.remove('show');
  setTimeout(function(){op.style.display='none';window.scrollTo(0,0);},500);
  markOpeningSeen();
  maybeShowReleaseNotes();
}
function initOpeningAnimation(){
  var skip=$('opSkipBtn');
  if(skip)skip.addEventListener('click',hideOpening);
  if(shouldShowOpening()){showOpening();}
  else{
    var op=$('opening');op.style.display='none';
    maybeShowReleaseNotes();
  }
}

/* ========== Auto resize textarea ========== */
function autoResizeInput(){
  var inp=$('quickInput');
  inp.style.height='auto';
  inp.style.height=Math.min(120,inp.scrollHeight)+'px';
}

/* ========== Theme / i18n apply ========== */
function applyTheme(theme){
  document.body.setAttribute('data-theme',theme);
  document.querySelector('meta[name="theme-color"]').setAttribute('content',getComputedStyle(document.body).getPropertyValue('--bg').trim());
}
function applyLanguage(lang){
  LANG=lang;
  // Update all data-i18n text
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    var key=el.getAttribute('data-i18n');
    if(key==='appName'&&el.classList.contains('brand-name')){el.textContent=t('appName');return;}
    if(el.tagName==='INPUT'||el.tagName==='TEXTAREA'){return;}
    el.textContent=t(key);
  });
  // Update placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
    el.placeholder=t(el.getAttribute('data-i18n-ph'));
  });
  document.documentElement.lang=lang;
  renderCurrent();
  updateHomeClock();
}

/* ========== Init ========== */
function b(id,ev,fn){var el=$(id);if(el)el.addEventListener(ev,fn);}
<<<<<<< HEAD
=======
var capabilityV200rc1=true;
var capabilityPermissionCenter=true;
var capabilityUnifiedComposer=true;
var capabilityV200rc2=true;
var capabilityV200rc3=true;
var capabilityV200rc4=true;
var capabilityV200rc51=true;
var capabilitySync=false; // quarantined
var capabilityAnalytics=true;
var capabilityDeviceIdentity=true;
var capabilityReminderEngine=true;
var capabilityCalendarBridge=true;
var capabilityReminderDiagnostics=true;
var capabilityDataSafety=true;
var capabilityTrash=true;
var capabilityUndo=true;
var capabilitySnapshots=true;
var capabilityEncryptedBackup=true;


/* ========== Data Safety helpers ========== */
function renderTrashList(){
  var container=$('trashList');if(!container)return;
  if(!window.ShikeTrashRepository){container.innerHTML='';return;}
  ShikeTrashRepository.getAll().then(function(items){
    if(!items||items.length===0){
      container.innerHTML='<div class="empty-state">'+t('trashEmpty')+'</div>';
      return;
    }
    var html='<div class="card-section"><div class="card-section-head"><div class="card-section-title">'+t('trashTitle')+' ('+items.length+')</div></div>';
    items.sort(function(a,b){return(b.deletedAt||'').localeCompare(a.deletedAt||'');});
    items.forEach(function(item){
      var rec=item.originalRecord||{};
      var title=rec.title||rec.text||'--';
      var dt=new Date(item.deletedAt||Date.now()).toLocaleString();
      html+='<div class="trash-item" data-id="'+item.id+'"><div class="trash-item-info"><div class="trash-item-title">'+escHtml(title)+'</div><div class="trash-item-date">'+escHtml(dt)+'</div></div>';
      html+='<button class="btn-restore" data-id="'+item.id+'">'+t('restoreRecord')+'</button>';
      html+='<button class="btn-perm-delete" data-id="'+item.id+'">'+t('permanentlyDelete')+'</button></div>';
    });
    html+='</div>';
    container.innerHTML=html;
    container.querySelectorAll('.btn-restore').forEach(function(btn){
      btn.addEventListener('click',function(){
        var id=btn.getAttribute('data-id');
        ShikeTrashRepository.restore(id).then(function(record){
          if(!record)return null;
          records.push(record);
          if(!saveRecords())throw new Error('restore_save_failed');
          var restoreGraph=window.ShikeChronosWeb?ShikeChronosWeb.restoreRecord(record.id):Promise.resolve(false);
          return restoreGraph.then(function(){renderCurrent();showToast(t('restoreRecord')+' OK','success');return record;});
        }).catch(function(){showToast('恢复失败，请重试。','error');});
      });
    });
    container.querySelectorAll('.btn-perm-delete').forEach(function(btn){
      btn.addEventListener('click',function(){
        var id=btn.getAttribute('data-id');
        var tombstone=items.find(function(item){return item.id===id;});
        if(confirm(t('permanentlyDelete')+'?')){
          ShikeTrashRepository.permanentlyDelete(id).then(function(){
            if(window.ShikeChronosWeb&&tombstone&&tombstone.originalRecord)return ShikeChronosWeb.purgeRecord(tombstone.originalRecord.id);
          }).then(function(){renderTrashList();}).catch(function(){showToast('永久删除未完成。','error');});
        }
      });
    });
  }).catch(function(){container.innerHTML='<div class="empty-state">'+t('trashEmpty')+'</div>';});
}
function renderSnapshotList(){
  var container=$('snapshotList');if(!container)return;
  if(!window.ShikeSnapshotService){container.innerHTML='';return;}
  ShikeSnapshotService.getAll().then(function(snaps){
    if(!snaps||snaps.length===0){
      container.innerHTML='<div class="card-section"><div class="card-section-head"><div class="card-section-title">'+t('snapshotTitle')+'</div></div><div class="empty-state">--</div><button class="btn-create-snapshot">'+t('createSnapshot')+'</button></div>';
    }else{
      var html='<div class="card-section"><div class="card-section-head"><div class="card-section-title">'+t('snapshotTitle')+' ('+snaps.length+')</div></div>';
      snaps.forEach(function(s){
        var dt=new Date(s.createdAt||Date.now()).toLocaleString();
        html+='<div class="snapshot-item" data-id="'+s.id+'"><div class="snapshot-item-info"><div class="snapshot-item-label">'+escHtml(s.label||'--')+'</div><div class="snapshot-item-date">'+escHtml(dt)+'</div><div class="snapshot-item-count">'+s.recordCount+' records</div></div>';
        html+='<button class="btn-restore-snap" data-id="'+s.id+'">'+t('restoreSnapshot')+'</button>';
        html+='<button class="btn-delete-snap" data-id="'+s.id+'">'+t('deleteSnapshot')+'</button></div>';
      });
      html+='</div>';
      container.innerHTML=html;
      container.querySelectorAll('.btn-restore-snap').forEach(function(btn){
        btn.addEventListener('click',function(){
          var id=btn.getAttribute('data-id');
          ShikeSnapshotService.getSnapshot(id).then(function(snap){
            if(snap&&snap.data&&confirm(t('restoreSnapshot')+'?')){
              if(confirm('This will replace current data. Continue?')){
                records=snap.data.slice();
                if(!saveRecords()){showToast('快照恢复失败。','error');return;}
                var restoreSidecar=window.ShikeChronosWeb?ShikeChronosWeb.restoreSnapshotSidecar(id):Promise.resolve(false);
                restoreSidecar.then(function(){renderCurrent();showToast(t('restoreSnapshot')+' OK','success');}).catch(function(){showToast('记录已恢复，但时间图谱恢复失败。','warn');});
              }
            }
          });
        });
      });
      container.querySelectorAll('.btn-delete-snap').forEach(function(btn){
        btn.addEventListener('click',function(){
          var id=btn.getAttribute('data-id');
          if(confirm(t('deleteSnapshot')+'?')){ShikeSnapshotService.deleteSnapshot(id).then(function(){renderSnapshotList();});}
        });
      });
    }
    var createBtn=container.querySelector('.btn-create-snapshot');
    if(createBtn){
      createBtn.addEventListener('click',function(){
        ShikeSnapshotService.createSnapshot('Manual snapshot',records).then(function(snapshot){
          var saveSidecar=window.ShikeChronosWeb&&snapshot?ShikeChronosWeb.saveSnapshotSidecar(snapshot.id):Promise.resolve(false);
          return saveSidecar.then(function(){renderSnapshotList();showToast(t('createSnapshot')+' OK','success');});
        }).catch(function(){showToast('快照创建失败。','error');});
      });
    }
  }).catch(function(e){container.innerHTML='<div class="empty-state">--</div>';});
}
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
function init(){
  // Prevent browser from auto-restoring previous scroll position
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  window.scrollTo(0,0);
  // First visit
  if(!settings.firstVisitAt){settings.firstVisitAt=Date.now();saveSettings(settings);}
  // Load data
  loadRecords();
  demoRouteCollapsed=readDemoRouteCollapsed();
  // Apply settings
  applyTheme(settings.theme);
  applyLanguage(settings.language);
  updateLayoutState();
  registerUnsavedWorkGuard();
  // Weather
  if(settings.weatherEnabled)document.body.classList.add('weather-on');
  // Opening
  initOpeningAnimation();
  // Clock & countdown
  startHomeClock();
  startCountdownTicker();
  // Voice
  initVoiceButton();
  // Input
  var inp=$('quickInput');
  autoResizeInput();
  inp.addEventListener('input',function(){
    autoResizeInput();
    if(parsePreviewTimer)clearTimeout(parsePreviewTimer);
    parsePreviewTimer=setTimeout(function(){
      if(isParsePreviewEnabled())showParsePreview(inp.value||'');
    },300);
  });
  inp.addEventListener('keydown',function(e){
    if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();directSaveFromInput();return;}
    if(e.key==='Escape'&&pendingParsePreview){e.preventDefault();pendingParsePreview=null;renderParsePreview();return;}
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();saveFromInput();}
  });
  b('saveBtn','click',saveFromInput);
  b('demoBtn','click',addDemoRecords);
  b('demoBtnMy','click',addDemoRecords);
  initSwipeActions();
  initTimeSprite();
<<<<<<< HEAD
=======
  try{
// Keep the legacy trash database isolated from the main local-first database.
if(window.ShikeTrashRepository&&ShikeTrashRepository.setMainStore){
  ShikeTrashRepository.setMainStore('shike_records');
}
if(window.ShikePermissionCenter&&typeof window.ShikePermissionCenter.init==='function')window.ShikePermissionCenter.init();
  // Start reminder scheduler
  if(window.ShikeReminderScheduler){ShikeReminderScheduler.start(60000);}}catch(e){}
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  // Nav
  document.querySelectorAll('.nav-item').forEach(function(n){
    n.addEventListener('click',function(){switchPage(n.dataset.page);});
  });
  // Calendar nav
  b('calPrev','click',function(){calViewDate.setMonth(calViewDate.getMonth()-1);renderCalendar();});
  b('calNext','click',function(){calViewDate.setMonth(calViewDate.getMonth()+1);renderCalendar();});
  // All filter
  document.querySelectorAll('#page-all .radio-chip[data-filter]').forEach(function(c){
    c.addEventListener('click',function(){
      allFilter=c.dataset.filter;
      document.querySelectorAll('#page-all .radio-chip[data-filter]').forEach(function(x){x.classList.remove('active');});
      c.classList.add('active');renderAll();
    });
  });
  var allSearch=$('allSearchInput');
  if(allSearch){
    allSearch.addEventListener('input',function(){
      var val=(allSearch.value||'').trim();
      if(allSearchTimer)clearTimeout(allSearchTimer);
      allSearchTimer=setTimeout(function(){
        allSearchQuery=val;
        if(currentPage==='all')renderAll();
      },180);
    });
  }
  // My page handlers
  b('usernameInput','change',function(){
    settings.username=($('usernameInput').value||'').trim();saveSettings(settings);renderMy();
  });
  document.querySelectorAll('.theme-dot').forEach(function(el){
    el.addEventListener('click',function(){
      settings.theme=el.dataset.theme;saveSettings(settings);applyTheme(settings.theme);renderMy();
    });
  });
  document.querySelectorAll('#langGroup .radio-chip').forEach(function(el){
    el.addEventListener('click',function(){
      settings.language=el.dataset.lang;saveSettings(settings);applyLanguage(settings.language);renderMy();
    });
  });
  document.querySelectorAll('#calModeGroup .radio-chip').forEach(function(el){
    el.addEventListener('click',function(){
      settings.calendarMode=el.dataset.calmode;saveSettings(settings);renderCalendar();renderMy();
    });
  });
  b('weatherSwitch','click',function(){
    setWeatherEnabled(!settings.weatherEnabled);renderMy();
  });
  b('reqNotifyBtn','click',function(){
    if(!('Notification' in window)){showToast(t('notifyUnsupported'),'warn');updateNotifyStatus();return;}
    Notification.requestPermission().then(function(p){
      updateNotifyStatus();
      if(p==='granted')checkDueNotifications();
      else if(p==='denied')showToast(t('notifyDeniedToast'),'warn');
    }).catch(function(){showToast(t('notifyUnsupported'),'warn');updateNotifyStatus();});
  });
<<<<<<< HEAD
=======
  b('testNotifyBtn','click',function(){
    if(window.ShikeReminderEngine&&typeof window.ShikeReminderEngine.testNotification==='function'){
      try{window.ShikeReminderEngine.testNotification();showToast('测试通知已发送','success');}catch(e){showToast('测试通知失败','error');}
    }else{
      showToast('提醒引擎未就绪','warn');
    }
  });
  b('defaultLeadTimeSelect','change',function(){
    var sel=$('defaultLeadTimeSelect');if(!sel)return;
    localStorage.setItem('shike_default_lead',sel.value);
    showToast('已保存默认提前时间','success');
  });
  (function(){
    var sel=$('defaultLeadTimeSelect');
    if(sel){
      var saved=localStorage.getItem('shike_default_lead');
      if(saved)sel.value=saved;
    }
  })();
  b('exportIcsBtnReminder','click',exportIcsFile);
  b('createSnapshotBtn','click',function(){
    if(!window.ShikeSnapshotService||typeof window.ShikeSnapshotService.create!=='function'){showToast('快照服务不可用','warn');return;}
    try{
      window.ShikeSnapshotService.create(records);
      showToast('快照已创建','success');
      renderMy();
    }catch(e){showToast('创建快照失败','error');}
  });
  b('emptyTrashBtn','click',function(){
    if(!window.ShikeTrashRepository||typeof window.ShikeTrashRepository.empty!=='function'){showToast('回收站不可用','warn');return;}
    if(confirm('确定清空回收站？此操作不可恢复。')){
      try{
        window.ShikeTrashRepository.empty();
        showToast('回收站已清空','success');
        renderMy();
      }catch(e){showToast('清空回收站失败','error');}
    }
  });
  b('reqMicBtn','click',function(){
    if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)){showToast('当前浏览器不支持麦克风','warn');return;}
    navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
      stream.getTracks().forEach(function(t){t.stop();});
      showToast('麦克风权限已授权','success');
      if(typeof updatePermStatus==='function')updatePermStatus();
    }).catch(function(){showToast('麦克风权限被拒绝','error');if(typeof updatePermStatus==='function')updatePermStatus();});
  });
  b('reqStorageBtn','click',function(){
    if(!(navigator.storage&&typeof navigator.storage.persist==='function')){showToast('当前浏览器不支持持久化存储','warn');return;}
    navigator.storage.persist().then(function(persisted){
      showToast(persisted?'存储已持久化':'存储持久化被拒绝',persisted?'success':'warn');
      if(typeof updatePermStatus==='function')updatePermStatus();
    }).catch(function(){showToast('存储持久化请求失败','error');if(typeof updatePermStatus==='function')updatePermStatus();});
  });
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  b('installPwaBtn','click',function(){
    if(!deferredInstallPrompt){showToast(t('pwaInstallHint'),'warn');return;}
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(function(){
      deferredInstallPrompt=null;
      var item=$('installPwaItem');if(item)item.style.display='none';
    });
  });
  b('replayBtn','click',function(){
    switchPage('home');
    setTimeout(function(){settings.openingSeen=false;saveSettings(settings);initOpeningAnimation();},300);
  });
  b('releaseOkBtn','click',closeReleaseNotes);
  b('releaseMask','click',function(e){if(e.target===$('releaseMask'))closeReleaseNotes();});
  b('viewCurrentReleaseBtn','click',function(){showReleaseNotes(true);});
  b('copyFeedbackMailBtn','click',function(e){e.preventDefault();copyFeedbackEmail();});
  b('copyFeedbackTemplateBtn','click',copyFeedbackTemplate);
  document.querySelectorAll('[data-feature-action]').forEach(function(btn){
    btn.addEventListener('click',function(){openFeatureHubAction(btn.dataset.featureAction);});
  });
  // Import handlers
  b('parseImportBtn','click',function(){
    var txt=$('importTextInput').value||'';
    importDrafts=prepareBatchCaptureDrafts(txt);
    renderDrafts();
  });
  b('loadExampleBtn','click',function(){
    $('importTextInput').value='下周一体检\n月底还信用卡\n每天睡前涂润唇膏\n7月8日妈妈生日\n明天下午三点开会\n待会喝水';
  });
  b('exportBtn','click',exportBackupFile);
  b('exportBackupBtnMy','click',exportBackupFile);
  b('exportQuarantineBtn','click',exportQuarantinedData);
  b('exportIcsBtn','click',exportIcsFile);
  function handleBackupFileInput(e){
    var f=e.target.files&&e.target.files[0];if(!f)return;
    if(f.size>MAX_BACKUP_FILE_SIZE){showToast(t('importFailed'),'error');e.target.value='';return;}
    var fr=new FileReader();fr.onload=function(ev){
      try{
        var parsed=parseBackupPayload(ev.target.result);
        var prepared=prepareBackupImport(parsed);
        if(prepared.summary.valid){
          renderImportPreview(prepared);
          switchPage('import');
        }else showToast(t('importFailed'),'error');
      }catch(err){showToast(t('importFailed'),'error');}
      e.target.value='';
    };fr.readAsText(f);
  }
  b('restoreFileInput','change',handleBackupFileInput);
  b('restoreFileInputMy','change',handleBackupFileInput);
  b('clearBtn','click',function(){
    showConfirm(t('clearData'),t('clearConfirm'),t('confirm'),t('cancel'),function(){
      records=[];saveRecords();switchPage('home');renderHome();showToast('已清空','success');
    });
  });
  b('importFileInput','change',function(e){
    var f=e.target.files&&e.target.files[0];if(!f)return;
    var fr=new FileReader();fr.onload=function(ev){
      var lines=(ev.target.result||'').split(/\r?\n/).map(function(s){return s.trim();}).filter(Boolean);
      $('importTextInput').value=lines.join('\n');
    };fr.readAsText(f);
  });
  // Visibility change: pause/resume timers
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){
      if(clockTimer)clearInterval(clockTimer);
      if(countdownTimer)clearInterval(countdownTimer);
    }else{
      startHomeClock();startCountdownTicker();
      checkDueNotifications();
      if(settings.weatherEnabled)fetchWeather();
    }
  });
  // Service worker
  if('serviceWorker' in navigator){
    var swUrl='sw.js?v='+encodeURIComponent(APP_VERSION);
    navigator.serviceWorker.register(swUrl,{updateViaCache:'none'}).then(function(reg){
      if(reg.waiting){reg.waiting.postMessage({type:'SKIP_WAITING'});showUpdateHint();}
      reg.addEventListener('updatefound',function(){
        var newSw=reg.installing;if(!newSw)return;
        newSw.addEventListener('statechange',function(){
          if(newSw.state==='installed'&&navigator.serviceWorker.controller){
            showUpdateHint();
          }
        });
      });
      reg.update().catch(function(){});
      setInterval(function(){reg.update().catch(function(){});},600000);
    }).catch(function(){});
    navigator.serviceWorker.addEventListener('controllerchange',function(){
      // Reload once after new SW takes over (only if user accepted)
    });
  }
  // Version check: clean old caches
  try{
    var lastVer=localStorage.getItem('shike_last_ver');
    localStorage.setItem('shike_last_ver',APP_VERSION);
    if(lastVer&&lastVer!==APP_VERSION&&'caches' in window){
      caches.keys().then(function(keys){keys.forEach(function(k){if(k.indexOf('shike-')===0)caches.delete(k);});});
    }
  }catch(e){}
  // Focus input when empty
  // Auto-focus removed: was causing mobile keyboard pop-up and scroll jump on first load
  // User must explicitly tap the input to focus it
  startNotificationChecker();
<<<<<<< HEAD
  // Watch center init
  if(window.ShikeWatchCenter){
    window.ShikeWatchCenter.init();
    window.ShikeWatchCenter.onRefresh(function(){updateWatchBadge();});
    updateWatchBadge();
  }
  // Initial render
  renderHome();
=======
    if(typeof showReleaseNotes==='function')showReleaseNotes();
  // Initial render
  renderHome();
  if(window.ShikeChronosWeb){
    ShikeChronosWeb.init({
      getRecords:function(){return records;},
      createRecordId:function(){return genId();},
      prepareRecord:function(draft,id){return normalizeRecord(ShikeTemporalIntelligence.toRecord(draft,function(){return id||genId();}));},
      saveRecord:function(draft,forcedId){
        var item=normalizeRecord(ShikeTemporalIntelligence.toRecord(draft,function(){return forcedId||genId();}));
        records.unshift(item);
        if(!saveRecords()){records=records.filter(function(record){return record.id!==item.id;});return null;}
        return item;
      },
      writeRecord:async function(item){
        var existing=records.find(function(record){return record.id===item.id;});if(existing)return existing;
        records.unshift(item);await persistRecordsDurably();return item;
      },
      removeRecord:function(id){records=records.filter(function(record){return record.id!==id;});saveRecords();},
      removeRecordDurably:async function(id){records=records.filter(function(record){return record.id!==id;});await persistRecordsDurably();return true;},
      updateRecord:function(id,changes){
        var record=records.find(function(item){return item.id===id;});if(!record)return false;
        if(changes.recordState)record.recordState=changes.recordState;
        if(changes.postpone){
          var current=record.dateKey?new Date(record.dateKey+'T12:00:00'):new Date();current.setDate(current.getDate()+1);
          record.dateKey=dateKeyFromDate(current);record.dateText=record.dateKey;record.postponeCount=Number(record.postponeCount||0)+1;
        }
        record.updatedAt=Date.now();return saveRecords();
      },
      updateRecordDurably:async function(id,changes){
        var record=records.find(function(item){return item.id===id;});if(!record)return false;
        Object.keys(changes||{}).forEach(function(key){record[key]=changes[key];});record.updatedAt=Date.now();await persistRecordsDurably();return true;
      },
      clearInput:function(source){
        var input=$('quickInput');var agentInput=$('agentInput');
        if(input&&input.value.trim()===String(source||'').trim()){
          input.value='';if(agentInput)agentInput.value='';autoResizeInput();
          if(window.ShikeComposerState)ShikeComposerState.clearDraft();
          if(window.ShikeComposerView)ShikeComposerView.updateButtonStates();
        }
      },
      onCaptureStart:function(){
        if(parsePreviewTimer)clearTimeout(parsePreviewTimer);
        pendingParsePreview=null;renderParsePreview();
      },
      openDetail:function(id){openDetail(id);},
      notify:function(message,type){showToast(message,type);},
      refresh:function(){renderCurrent();},
      download:function(filename,content,type){downloadTextFile(filename,content,type);}
    });
  }
>>>>>>> fb900d61fab1a0a0ab834a72dacffb83baebcf34
  // Ensure scroll at top after initial render
  requestAnimationFrame(function(){window.scrollTo(0,0);});
  setTimeout(function(){window.scrollTo(0,0);},150);
}
function showUpdateHint(){
  var old=document.querySelector('.update-hint');if(old)return;
  var d=document.createElement('div');d.className='update-hint';
  d.innerHTML='已更新新版本，<button id="uhReload">刷新</button>生效';
  document.body.appendChild(d);
  var btn=d.querySelector('#uhReload');btn.addEventListener('click',function(){
    window.location.reload(true);
  });
  setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},15000);
}
window.addEventListener('DOMContentLoaded',function(){
  if(!window.ShikeLocalFirst){init();return;}
  ShikeLocalFirst.bootstrap().then(function(result){window.ShikePreloadedRecords=result.records;init();}).catch(function(){init();});
});
window.addEventListener('error',function(e){
  // Silent catch for non-critical errors
  console.warn('Shike error:',e.message);
});
