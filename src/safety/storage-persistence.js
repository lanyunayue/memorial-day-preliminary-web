/**
 * Storage Persistence Module
 * 
 * Manages persistent storage requests and quota estimation.
 * Provides UI-facing status information about storage persistence.
 *
 * Global: window.ShikeStoragePersistence
 */
(function(global){
  'use strict';

  var PERSIST_KEY = 'shike_storage_persist_checked';

  /**
   * Check if persistent storage is supported.
   * @returns {boolean}
   */
  function isSupported(){
    return !!(global.navigator && global.navigator.storage && global.navigator.storage.persist);
  }

  /**
   * Check if storage is already persistent.
   * @returns {Promise<boolean>}
   */
  async function isPersisted(){
    if(!isSupported()) return false;
    try{
      return await global.navigator.storage.persisted();
    }catch(e){
      return false;
    }
  }

  /**
   * Request persistent storage.
   * @returns {Promise<boolean>} true if granted or already persistent
   */
  async function requestPersist(){
    if(!isSupported()) return false;
    try{
      var already = await global.navigator.storage.persisted();
      if(already) return true;
      var result = await global.navigator.storage.persist();
      if(result){
        try{ localStorage.setItem(PERSIST_KEY, '1'); }catch(e){}
      }
      return result;
    }catch(e){
      return false;
    }
  }

  /**
   * Get storage estimate.
   * @returns {Promise<{usage: number, quota: number, usagePercent: number}|null>}
   */
  async function getEstimate(){
    if(!global.navigator || !global.navigator.storage || !global.navigator.storage.estimate){
      return null;
    }
    try{
      var est = await global.navigator.storage.estimate();
      var usage = est.usage || 0;
      var quota = est.quota || 0;
      var percent = quota > 0 ? Math.round((usage / quota) * 100) : 0;
      return {
        usage: usage,
        quota: quota,
        usagePercent: percent
      };
    }catch(e){
      return null;
    }
  }

  /**
   * Format bytes to human-readable string.
   * @param {number} bytes
   * @returns {string}
   */
  function formatBytes(bytes){
    if(!bytes || bytes < 0) return '0 B';
    if(bytes < 1024) return bytes + ' B';
    if(bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if(bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }

  /**
   * Get full storage status for UI rendering.
   * @returns {Promise<object>}
   */
  async function getStatus(){
    var persisted = await isPersisted();
    var estimate = await getEstimate();
    return {
      supported: isSupported(),
      persisted: persisted,
      estimate: estimate,
      usageText: estimate ? formatBytes(estimate.usage) : '--',
      quotaText: estimate ? formatBytes(estimate.quota) : '--',
      usagePercent: estimate ? estimate.usagePercent : 0,
      advice: getAdvice(persisted, estimate)
    };
  }

  function getAdvice(persisted, estimate){
    if(!isSupported()){
      return '当前浏览器不支持持久化存储，数据可能被自动清理。建议定期导出备份。';
    }
    if(!persisted){
      return '存储未持久化，浏览器可能在空间不足时清理数据。点击"请求持久化"以降低风险。';
    }
    if(estimate && estimate.usagePercent > 80){
      return '存储空间使用率超过80%，建议清理不需要的记录或导出备份后删除旧数据。';
    }
    return '存储已持久化，数据安全性较高。';
  }

  /**
   * Render storage status into a container element.
   * @param {HTMLElement} container
   */
  async function render(container){
    if(!container) return;
    var status = await getStatus();
    var html = '<div class="storage-status-card">';
    html += '<div class="storage-status-row"><span>持久化支持</span><span>' + (status.supported ? '支持' : '不支持') + '</span></div>';
    html += '<div class="storage-status-row"><span>持久化状态</span><span>' + (status.persisted ? '已持久化' : '未持久化') + '</span></div>';
    if(status.estimate){
      html += '<div class="storage-status-row"><span>已使用</span><span>' + status.usageText + '</span></div>';
      html += '<div class="storage-status-row"><span>可用空间</span><span>' + status.quotaText + '</span></div>';
      html += '<div class="storage-status-row"><span>使用率</span><span>' + status.usagePercent + '%</span></div>';
    }
    html += '<div class="storage-status-advice">' + status.advice + '</div>';
    if(status.supported && !status.persisted){
      html += '<button class="btn-persist" id="btnRequestPersist">请求持久化</button>';
    }
    html += '</div>';
    container.innerHTML = html;

    var btn = container.querySelector('#btnRequestPersist');
    if(btn){
      btn.addEventListener('click', async function(){
        btn.disabled = true;
        btn.textContent = '请求中...';
        var result = await requestPersist();
        if(result){
          btn.textContent = '已持久化';
          btn.classList.add('success');
        }else{
          btn.textContent = '请求失败';
          btn.disabled = false;
        }
        setTimeout(function(){ render(container); }, 1000);
      });
    }
  }

  global.ShikeStoragePersistence = Object.freeze({
    isSupported: isSupported,
    isPersisted: isPersisted,
    requestPersist: requestPersist,
    getEstimate: getEstimate,
    getStatus: getStatus,
    formatBytes: formatBytes,
    render: render
  });

})(typeof window !== 'undefined' ? window : this);
