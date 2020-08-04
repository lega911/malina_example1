(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.MyWidget = factory());
}(this, (function () { 'use strict';

    function $watch(cd, fn, callback, w) {
        if(!w) w = {};
        w.fn = fn;
        w.cb = callback;
        if(!('value' in w)) w.value = NaN;
        cd.watchers.push(w);
        return w;
    }
    function $watchReadOnly(cd, fn, callback) {
        return $watch(cd, fn, callback, {ro: true});
    }
    function addEvent(cd, el, event, callback) {
        el.addEventListener(event, callback);
        cd_onDestroy(cd, () => {
            el.removeEventListener(event, callback);
        });
    }
    function cd_onDestroy(cd, fn) {
        cd.destroyList.push(fn);
    }
    function $$removeItem(array, item) {
        let i = array.indexOf(item);
        if(i>=0) array.splice(i, 1);
    }
    function $ChangeDetector(parent) {
        this.parent = parent;
        this.children = [];
        this.watchers = [];
        this.destroyList = [];
        this.prefix = [];
    }
    $ChangeDetector.prototype.new = function() {
        var cd = new $ChangeDetector(this);
        this.children.push(cd);
        return cd;
    };

    $ChangeDetector.prototype.destroy = function(option) {
        if(option !== false && this.parent) $$removeItem(this.parent.children, this);
        this.watchers.length = 0;
        this.prefix.length = 0;
        this.destroyList.forEach(fn => {
            try {
                fn();
            } catch (e) {
                console.error(e);
            }
        });
        this.destroyList.length = 0;
        this.children.forEach(cd => {
            cd.destroy(false);
        });
        this.children.length = 0;
    };

    function $digest($cd) {
        let loop = 10;
        let w;
        while(loop >= 0) {
            let changes = 0;
            let index = 0;
            let queue = [];
            let i, value, cd = $cd;
            while(cd) {
                for(i=0;i<cd.prefix.length;i++) cd.prefix[i]();
                for(i=0;i<cd.watchers.length;i++) {
                    w = cd.watchers[i];
                    value = w.fn();
                    if(w.value !== value) {
                        if(w.cmp) {
                            changes += w.cmp(w, value);
                        } else {
                            w.value = value;
                            if(!w.ro) changes++;
                            w.cb(w.value);
                        }
                    }
                }            if(cd.children.length) queue.push.apply(queue, cd.children);
                cd = queue[index++];
            }
            loop--;
            if(!changes) break;
        }
        if(loop < 0) console.error('Infinity changes: ', w);
    }

    let templatecache = {false: {}, true: {}, svg: {}};

    let $$uniqIndex = 1;

    const $$childNodes = 'childNodes';

    function $$htmlToFragment(html, lastNotTag) {
        lastNotTag = !!lastNotTag;
        if(templatecache[lastNotTag][html]) return templatecache[lastNotTag][html].cloneNode(true);

        let t = document.createElement('template');
        t.innerHTML = html;
        let result = t.content;
        if(lastNotTag && result.lastChild.nodeType == 8) result.appendChild(document.createTextNode(''));
        templatecache[lastNotTag][html] = result.cloneNode(true);
        return result;
    }
    function $$htmlToFragmentClean(html, lastNotTag) {
        lastNotTag = !!lastNotTag;
        if(templatecache[lastNotTag][html]) return templatecache[lastNotTag][html].cloneNode(true);
        let result = $$htmlToFragment(html, lastNotTag);
        let it = document.createNodeIterator(result, 128);
        let n;
        while(n = it.nextNode()) {
            if(!n.nodeValue) n.parentNode.replaceChild(document.createTextNode(''), n);
        }    templatecache[lastNotTag][html] = result.cloneNode(true);
        return result;
    }

    let _tick_list = [];
    let _tick_planned = {};
    function $tick(fn, uniq) {
        if(uniq) {
            if(_tick_planned[uniq]) return;
            _tick_planned[uniq] = true;
        }
        _tick_list.push(fn);
        if(_tick_planned.$tick) return;
        _tick_planned.$tick = true;
        setTimeout(() => {
            _tick_planned = {};
            let list = _tick_list;
            _tick_list = [];
            list.forEach(fn => {
                try {
                    fn();
                } catch (e) {
                    console.error(e);
                }
            });
        }, 0);
    }
    function $$makeApply($cd) {
        let id = `a${$$uniqIndex++}`;
        return function apply() {
            if(apply._p) return;
            $tick(() => {
                try {
                    apply._p = true;
                    $digest($cd);
                } finally {
                    apply._p = false;
                }
            }, id);
        };
    }

    function $$makeComponent($element, $option) {
        let $component = {
            $cd: new $ChangeDetector(),
            exportedProps: {},
            push: []
        };

        $component.destroy = () => $component.$cd.destroy();
        $component.$$render = (rootTemplate) => {
            if ($option.afterElement) {
                $element.parentNode.insertBefore(rootTemplate, $element.nextSibling);
            } else {
                $element.innerHTML = '';
                $element.appendChild(rootTemplate);
            }
        };

        return $component;
    }

    const addStyles = (id, content) => {
        if(document.head.querySelector('style#' + id)) return;
        let style = document.createElement('style');
        style.id = id;
        style.innerHTML = content;
        document.head.appendChild(style);
    };


    const bindText = (cd, element, fn) => {
        $watchReadOnly(cd, fn, value => {
            element.textContent = value;
        });
    };

    function MyWidget($element, $option) {
      if (!$option) $option = {};
      if (!$option.events) $option.events = {};
      const $props = $option.props || ({});
      const $component = $$makeComponent($element, $option);
      const $$apply = $$makeApply($component.$cd);
      $component.push = $$apply;
      let name = 'world';
      
            return (function() {
                let $cd = $component.$cd;
        function $$build2($cd, $parentElement) {
    const el3 = $parentElement;
    const el0 = el3[$$childNodes][1][$$childNodes][0];
    const el1 = el3[$$childNodes][3];
    bindText($cd, el0, () => `Hello `+(name)+`!`);
    {
                
                let $element=el1;
                addEvent($cd, $element, 'input', () => { name=$element.value; $$apply(); });
                $watchReadOnly($cd, () => (name), (value) => { if(value != $element.value) $element.value = value; });
            }
    {
                let $element=el1;
                $tick(() => { $element.focus(); $$apply(); });}}const rootTemplate = $$htmlToFragmentClean(` <h1 class="m3w4bea"> </h1> <input type="text"/> `);
            $$build2($cd, rootTemplate);
            $component.$$render(rootTemplate);
        
            addStyles('m3w4bea', `h1.m3w4bea{color:blue}`);
        
                $$apply();
                return $component;
            })();}

    return MyWidget;

})));
