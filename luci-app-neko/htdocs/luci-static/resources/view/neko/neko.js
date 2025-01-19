/*
 * Copyright (C) 2024 Nosignal <https://github.com/nosignals>
 * 
 * Contributors:
 * - bobbyunknown <https://github.com/bobbyunknown>
 *
 * https://opensource.org/license/mit
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';
'require view';
'require uci';
'require ui';
'require fs';
'require form';

return view.extend({
    handleServiceAction: function(action) {
        var btn = document.activeElement;
        var originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<div class="loading-spinner"></div>';

        return fs.exec('/etc/init.d/neko', [action])
            .then(function(res) {
                if (res.code === 0) {
                    ui.addNotification(null, E('p', _('Service ' + action + ' success')), 'success');
                    window.location.reload();
                } else {
                    btn.disabled = false;
                    btn.innerHTML = originalContent;
                    ui.addNotification(null, E('p', _('Service ' + action + ' failed: ' + res.stderr)), 'error');
                }
            })
            .catch(function(err) {
                btn.disabled = false;
                btn.innerHTML = originalContent;
                ui.addNotification(null, E('p', _('Service ' + action + ' failed: ' + err)), 'error');
            });
    },

    load: function() {
        return Promise.all([
            uci.load('neko'),
            L.resolveDefault(fs.stat('/etc/neko/tmp/singbox_pid.txt'), null).then(function(stat) {
                if (stat)
                    return fs.read('/etc/neko/tmp/singbox_pid.txt');
                return '';
            })
        ]);
    },

    render: function(data) {
        let show_luci = uci.get('neko', 'cfg', 'show_luci');
        let running = data[1].trim() !== '';

        if (show_luci === '1') {
            return E('iframe', {
                src: window.location.protocol + "//" + window.location.hostname + '/nekoclash',
                style: 'width: 100%; min-height: 95vh; border: none; border-radius: 5px; resize: vertical;'
            });
        }

        if (show_luci === '0') {
            return E('div', { 'class': 'cbi-map' }, [
                E('style', {}, `
                    .loading-spinner {
                        display: inline-block;
                        width: 16px;
                        height: 16px;
                        border: 2px solid rgba(255,255,255,.3);
                        border-radius: 50%;
                        border-top-color: #fff;
                        animation: spin 1s ease-in-out infinite;
                        margin: 0 auto;
                    }

                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `),
                E('h2', {}, [ _('NekoClash') ]),
                E('div', { 'class': 'cbi-map-descr' }, [ _('Mihomo/Singbox Core') ]),
                E('div', { 'class': 'cbi-section' }, [
                    E('div', { 'class': 'cbi-section-node' }, [
                        E('div', { 'class': 'cbi-value' }, [
                            E('label', { 'class': 'cbi-value-title' }, [ _('Service Status') ]),
                            E('div', { 'class': 'cbi-value-field' }, [
                                E('span', { 'style': running ? 'color:green' : 'color:red' },
                                    [ running ? _('Running') : _('Stopped') ])
                            ])
                        ]),
                        E('div', { 'class': 'cbi-value-field' }, [
                            running ? E('button', {
                                'class': 'cbi-button cbi-button-negative',
                                'click': L.bind(function() {
                                    return this.handleServiceAction('stop');
                                }, this)
                            }, [ _('Stop') ]) : E('button', {
                                'class': 'cbi-button cbi-button-apply',
                                'click': L.bind(function() {
                                    return this.handleServiceAction('start');
                                }, this)
                            }, [ _('Start') ]),
                            ' ',
                            E('button', {
                                'class': 'cbi-button cbi-button-action',
                                'style': running ? '' : 'display:none',
                                'click': L.bind(function() {
                                    return this.handleServiceAction('restart');
                                }, this)
                            }, [ _('Restart') ]),
                            ' ',
                            E('button', {
                                'class': 'cbi-button cbi-button-apply',
                                'click': function() {
                                    window.open('/nekoclash', '_blank', 'noopener');
                                }
                            }, [ _('Open Neko') ])
                        ])
                    ])
                ])
            ]);
        }

        return m.render();
    },

    handleSaveApply: null,
    handleSave: null,
    handleReset: null
});