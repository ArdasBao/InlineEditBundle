<?php
/**
 * User: taldy
 * Date: 28.02.15
 * Time: 1:55
 */

namespace ArdasBao\InlineEditBundle\Templating\Node;


use ArdasBao\InlineEditBundle\Templating\InlineEditExtension;

class InlineEditorNode extends \Twig_Node {

    protected $extension;

    public function __construct($variable, \Twig_Node $defaultValue, $preset, $lineno, $tag = null, InlineEditExtension $extension)
    {
        parent::__construct(array('defaultValue' => $defaultValue), array('variable' => $variable, 'preset' => $preset), $lineno, $tag);

        $this->extension = $extension;
    }

    /**
     * Compiles the node to PHP.
     *
     * @param Twig_Compiler $compiler A Twig_Compiler instance
     */
    public function compile(\Twig_Compiler $compiler)
    {
        $compiler
            ->write("ob_start();\n")
            ->subcompile($this->getNode('defaultValue'))
            ->write("\$tmp = ob_get_clean();\n")
            ->write(sprintf("echo \$this->env->getExtension('ardasbao_inlineeditor_extension')->getInlineEditableHTMLVariable('%s', \$tmp, '%s');\n", $this->getAttribute('variable'), $this->getAttribute('preset')));
    }
}