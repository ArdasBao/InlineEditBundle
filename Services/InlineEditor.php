<?php
/**
 * User: taldy
 * Date: 28.02.15
 * Time: 2:26
 */

namespace ArdasBao\InlineEditBundle\Services;

use Symfony\Component\DependencyInjection\ContainerInterface;

class InlineEditor {

    protected $serviceContainer;

    protected $editorRole;
    protected $variablesManager;

    public function __construct(ContainerInterface $serviceContainer, array $options)
    {
        $this->serviceContainer = $serviceContainer;

        $this->editorRole = $options['editorRole'];
        $this->variablesManager = $options['variablesManager'];
    }

    public function isInlineEditAllowed()
    {
        return $this->editorRole && $this->getSecurityContext()->isGranted($this->editorRole);
    }

    public function get($name)
    {
        return $this->getVariablesManager()->get($name);
    }

    /**
     * @throws \Exception
     * @return mixed
     */
    protected function getVariablesManager()
    {
        if ($this->serviceContainer->has($this->variablesManager)) {
            return $this->serviceContainer->get($this->variablesManager);
        }
        else {
            throw new \Exception('Variables Manager is not available.');
        }
    }

    /**
     * @return SecurityContext
     */
    protected function getSecurityContext()
    {
        return $this->serviceContainer->get('security.context');
    }
}