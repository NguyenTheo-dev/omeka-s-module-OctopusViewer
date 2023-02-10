<?php

namespace MediaViewer\Controller\Site;

use Laminas\Mvc\Controller\AbstractActionController;
use Laminas\View\Model\ViewModel;
use Laminas\View\Model\JsonModel;
use MediaViewer\MediaRenderer\Manager as MediaRendererManager;

class ViewerController extends AbstractActionController
{
    protected $mediaRendererManager;

    public function __construct(MediaRendererManager $mediaRendererManager)
    {
        $this->mediaRendererManager = $mediaRendererManager;
    }

    public function mediaSelectorAction()
    {
        $medias = $this->api()->search('media', $this->params()->fromQuery())->getContent();

        $view = new ViewModel();
        $view->setTerminal(true);
        $view->setVariable('medias', $medias);

        $this->getResponse()->getHeaders()->addHeaderLine('Access-Control-Allow-Origin', '*');

        return $view;
    }

    public function jsDependenciesAction()
    {
        $jsDependencies = [];

        $mediaRendererNames = $this->mediaRendererManager->getRegisteredNames();
        foreach ($mediaRendererNames as $mediaRendererName) {
            $mediaRenderer = $this->mediaRendererManager->get($mediaRendererName);
            $mediaRendererJsDependencies = $mediaRenderer->getJsDependencies($this->viewHelpers());
            $jsDependencies = array_merge($jsDependencies, $mediaRendererJsDependencies);
        }

        $view = new JsonModel();
        $view->setVariable('jsDependencies', $jsDependencies);

        $this->getResponse()->getHeaders()->addHeaderLine('Access-Control-Allow-Origin', '*');

        return $view;
    }
}
