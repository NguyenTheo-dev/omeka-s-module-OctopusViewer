(function () {
    'use strict';

    const src = document.currentScript.src;
    const baseUrlEnd = src.indexOf('/modules/OctopusViewer/asset/js/octopusviewer-viewer.js');
    const baseUrl = src.substring(0, baseUrlEnd);

    class OctopusViewerViewer extends HTMLElement {
        constructor() {
            super();

            const shadowRoot = this.attachShadow({ mode: "open" });
        }

        connectedCallback () {
            const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', new URL('/modules/OctopusViewer/asset/css/octopusviewer-viewer.css', baseUrl));
            this.shadowRoot.appendChild(link);
            this.shadowRoot.appendChild(template.content.cloneNode(true));

            const mediaSelectorPromise = this.fetchMediaSelector();
            const jsDependenciesPromise = this.loadJsDependencies();

            Promise.all([mediaSelectorPromise, jsDependenciesPromise])
                .then(([mediaSelectorHTML]) => {
                    const mediaSelector = this.shadowRoot.querySelector('.octopusviewer-media-selector-list');
                    mediaSelector.innerHTML = mediaSelectorHTML;

                    this.attachEventListeners();

                    this.shadowRoot.querySelector('.octopusviewer-viewer').classList.add('loaded');

                    const firstMedia = this.shadowRoot.querySelector('.octopusviewer-media-selector-element');
                    if (firstMedia) {
                        this.showMedia(firstMedia);
                    }
                });
        }

        fetchMediaSelector () {
            const mediaSelectorUrl = new URL('/s/' + this.siteSlug + '/octopusviewer/viewer/media-selector', baseUrl);
            mediaSelectorUrl.search = this.mediaQuery;

            return fetch(mediaSelectorUrl).then(res => res.text())
        }

        loadJsDependencies () {
            const jsDependenciesUrl = new URL('/s/' + this.siteSlug + '/octopusviewer/viewer/js-dependencies', baseUrl);
            return fetch(jsDependenciesUrl)
                .then(res => res.json())
                .then(data => {
                    const promises = [];
                    for (const jsDependency of data.jsDependencies) {
                        if (document.scripts.namedItem(jsDependency)) {
                            continue;
                        }
                        promises.push(this.loadScript(jsDependency));
                    }
                    return Promise.allSettled(promises);
                });
        }

        loadScript (src) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.id = src;
                script.src = new URL(src, baseUrl);
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        attachEventListeners () {
            this.shadowRoot.querySelector('.octopusviewer-fullscreen').addEventListener('click', () => {
                if (document.fullscreenElement === this) {
                    document.exitFullscreen();
                } else {
                    this.shadowRoot.querySelector('.octopusviewer-viewer').requestFullscreen();
                }
            });

            const mediaSelector = this.shadowRoot.querySelector('.octopusviewer-media-selector');

            mediaSelector.addEventListener('click', ev => {
                ev.preventDefault();
                const el = ev.target.closest('.octopusviewer-media-selector-element');
                if (!el) {
                    return;
                }

                ev.stopPropagation();

                this.showMedia(el);
            });

            this.shadowRoot.querySelector('.octopusviewer-viewer').addEventListener('click', ev => {
                ev.preventDefault();
                const el = ev.target.closest('.collapse-toggle');
                if (!el) {
                    return;
                }

                ev.stopPropagation();

                ev.target.closest('.sidebar').classList.toggle('collapsed');
            });
        }

        showMedia (mediaElement) {
            const octopusViewer = this.shadowRoot.querySelector('.octopusviewer-viewer');
            const mediaRenderUrl = new URL(mediaElement.getAttribute('data-octopusviewer-render-url'), baseUrl);
            const mediaInfoUrl = new URL(mediaElement.getAttribute('data-octopusviewer-info-url'), baseUrl);
            const mediaView = octopusViewer.querySelector('.octopusviewer-media-view');
            const mediaInfo = octopusViewer.querySelector('.octopusviewer-media-info-metadata');

            mediaView.innerHTML = '';
            fetch(mediaRenderUrl).then(response => {
                return response.text();
            }).then(text => {
                mediaView.innerHTML = text;
            });

            mediaInfo.innerHTML = '';
            fetch(mediaInfoUrl).then(response => {
                return response.text();
            }).then(text => {
                mediaInfo.innerHTML = text;
            });

            mediaElement.closest('.octopusviewer-media-selector').querySelectorAll('.octopusviewer-media-selector-element').forEach(e => {
                e.classList.remove('octopusviewer-selected');
            });
            mediaElement.classList.add('octopusviewer-selected');
        }

        get mediaQuery () {
            return this.getAttribute('media-query');
        }

        set mediaQuery (query) {
            this.setAttribute('media-query', query);
        }

        get siteSlug () {
            return this.getAttribute('site-slug');
        }

        set siteSlug (slug) {
            this.setAttribute('site-slug', slug);
        }
    }

    const template = document.createElement('template');
    template.innerHTML = `
<div class="octopusviewer-viewer">
    <div class="octopusviewer-header">
        <div class="octopusviewer-title"><slot name="title"></slot></div>
        <a class="octopusviewer-fullscreen"><i class="octopusviewer-icon-fullscreen"></i></a>
    </div>
    <div class="octopusviewer-body">
        <div class="octopusviewer-media-selector sidebar sidebar-left">
            <div class="sidebar-header collapse-toggle">
                <i class="octopusviewer-icon-collapse"></i>
            </div>
            <div class="sidebar-content octopusviewer-media-selector-list"></div>
        </div>
        <div class="octopusviewer-media-view"></div>
        <div class="octopusviewer-media-info sidebar sidebar-right">
            <div class="sidebar-header collapse-toggle">
                <i class="octopusviewer-icon-collapse"></i>
            </div>
            <div class="sidebar-content octopusviewer-media-info-metadata"></div>
        </div>
    </div>
    <div class="octopusviewer-footer"></div>
</div>
    `;

    window.customElements.define('octopusviewer-viewer', OctopusViewerViewer);
})();
