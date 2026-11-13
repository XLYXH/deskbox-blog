// 自写的几个轻量 rehype 插件：标题锚点、代码块外框、外链属性
import GithubSlugger from 'github-slugger';

function walk(node, fn, parent = null, index = 0) {
  fn(node, parent, index);
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) walk(node.children[i], fn, node, i);
  }
}

function text(node) {
  if (node.type === 'text') return node.value;
  return (node.children || []).map(text).join('');
}

const el = (tagName, properties = {}, children = []) => ({ type: 'element', tagName, properties, children });

/** h2/h3：生成稳定 id，并在末尾加一个可聚焦的 # 锚点 */
export function rehypeHeadingAnchors() {
  return (tree) => {
    const slugger = new GithubSlugger();
    walk(tree, (node) => {
      if (node.type !== 'element' || !/^h[2-4]$/.test(node.tagName)) return;
      const label = text(node).trim();
      const id = node.properties.id || slugger.slug(label);
      node.properties.id = id;
      node.children.push(
        el('a', { className: ['h-anchor'], href: `#${id}`, ariaLabel: `链接到“${label}”` }, [
          { type: 'text', value: '#' },
        ]),
      );
    });
  };
}

/** 代码块：包一层 figure，顶部显示语言与复制按钮（按钮由客户端脚本激活） */
export function rehypeCodeFrame() {
  return (tree) => {
    walk(tree, (node, parent, index) => {
      if (!parent || node.type !== 'element' || node.tagName !== 'pre') return;
      if (parent.tagName === 'figure' && (parent.properties.className || []).includes('code')) return;
      const lang = node.properties.dataLanguage || 'text';
      const lines = text(node).replace(/\n$/, '').split('\n').length;
      const frame = el('figure', { className: ['code'], dataLang: lang }, [
        el('figcaption', { className: ['code__bar'] }, [
          el('span', { className: ['code__dots'], ariaHidden: 'true' }, [el('i'), el('i'), el('i')]),
          el('span', { className: ['code__lang'] }, [{ type: 'text', value: lang }]),
          el('span', { className: ['code__lines'] }, [{ type: 'text', value: `${lines} 行` }]),
          el('button', { type: 'button', className: ['code__copy'], ariaLabel: '复制代码', dataCopy: '' }, [
            el('span', { className: ['code__copy-label'] }, [{ type: 'text', value: '复制' }]),
          ]),
        ]),
        node,
      ]);
      parent.children[index] = frame;
    });
  };
}

/** 外链：新标签打开 */
export function rehypeExternalLinks() {
  return (tree) => {
    walk(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'a') return;
      const href = String(node.properties.href || '');
      if (/^https?:\/\//.test(href)) {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener', 'noreferrer'];
      }
    });
  };
}

/** 表格：包一层可横向滚动的容器 */
export function rehypeTableWrap() {
  return (tree) => {
    walk(tree, (node, parent, index) => {
      if (!parent || node.type !== 'element' || node.tagName !== 'table') return;
      if (parent.tagName === 'div' && (parent.properties.className || []).includes('table-wrap')) return;
      parent.children[index] = el('div', { className: ['table-wrap'], tabIndex: 0, role: 'region', ariaLabel: '表格（可横向滚动）' }, [node]);
    });
  };
}
