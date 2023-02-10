Embed the viewer on another site
================================

.. warning::

    This feature is experimental

The viewer can be embedded on another website as a `web component
<https://developer.mozilla.org/en-US/docs/Web/Web_Components>`_.

To do that, add the following HTML code to your site:

.. code-block:: html

    <script src="{BASE_URL}/modules/MediaViewer/asset/js/mediaviewer-viewer.js?v=0.1.0"></script>
    <mediaviewer-viewer
        media-selector-url="/s/{SITE_SLUG}/mediaviewer/viewer/media-selector?{MEDIA_QUERY}"
        js-dependencies-url="/s/{SITE_SLUG}/mediaviewer/viewer/js-dependencies"
    >
        <span slot="title">{TITLE}</span>
    </mediaviewer-viewer>

Then replace all words surrounded by ``{`` and ``}``:

* ``{BASE_URL}`` should be replaced by the base URL of Omeka
* ``{MEDIA_QUERY}`` should be replaced by a list of URL parameters (separated
  by ``&``). This will define which media will be displayed.
* ``{SITE_SLUG}`` should be replaced by the identifier of an existing Omeka S
  site
* ``{TITLE}`` should be replaced by the text to be displayed in the viewer
  header

For instance:

.. code-block:: html

    <script src="https://omeka.example.com/modules/MediaViewer/asset/js/mediaviewer-viewer.js"></script>
    <mediaviewer-viewer
        media-selector-url="/s/home/mediaviewer/viewer/media-selector?item_id=23"
        js-dependencies-url="/s/home/mediaviewer/viewer/js-dependencies"
    >
        <span slot="title">All media of item #23</span>
    </mediaviewer-viewer>
