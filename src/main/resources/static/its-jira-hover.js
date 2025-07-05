/**
 * its-jira-hover.js
 * 在 PolyGerrit 中，鼠标悬停 JIRA 链接时弹出 Issue 详情浮层
 */
Gerrit.install(plugin => {
  plugin.on('showchange', () => {
    const obs = new MutationObserver(() => {
      // 匹配所有指向 /browse/KEY-123 的链接
      document.querySelectorAll('a[href*="/browse/"]').forEach(link => {
        if (link.dataset.itsJiraHover) return;
        link.dataset.itsJiraHover = '1';

        link.addEventListener('mouseenter', async () => {
          const m = link.href.match(/\/browse\/([A-Z]+-\d+)/);
          if (!m) return;
          const issueKey = m[1];
          try {
            const res = await fetch(
              `/plugins/its-jira/issue/${issueKey}`
            );
            if (!res.ok) return;
            const issue = await res.json();
            showTooltip(link, issue);
          } catch (e) {
            console.warn('its-jira-hover fetch error', e);
          }
        });

        link.addEventListener('mouseleave', () => {
          document.getElementById('its-jira-hover-tip')?.remove();
        });
      });
    });

    obs.observe(document.body, { childList: true, subtree: true });
  });
});

function showTooltip(link, issue) {
  removeTooltip();
  const tip = document.createElement('div');
  tip.id = 'its-jira-hover-tip';
  Object.assign(tip.style, {
    position: 'absolute',
    background: '#fff',
    border: '1px solid #ccc',
    padding: '6px 10px',
    borderRadius: '4px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    zIndex: 9999,
    fontSize: '12px',
    maxWidth: '300px'
  });
  const r = link.getBoundingClientRect();
  tip.style.top  = `${r.bottom + window.scrollY + 5}px`;
  tip.style.left = `${r.left + window.scrollX}px`;

  tip.innerHTML = `
    <strong>${issue.key}</strong>: ${issue.fields.summary}<br>
    状态：${issue.fields.status.name} ｜  
    负责人：${issue.fields.assignee?.displayName || '未分配'}
  `;
  document.body.appendChild(tip);
}

function removeTooltip() {
  document.getElementById('its-jira-hover-tip')?.remove();
}
