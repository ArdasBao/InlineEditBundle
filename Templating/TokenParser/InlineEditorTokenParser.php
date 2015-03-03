<?php
/**
 * User: taldy
 * Date: 28.02.15
 * Time: 1:25
 */

namespace ArdasBao\InlineEditBundle\Templating\TokenParser;

use ArdasBao\InlineEditBundle\Templating\InlineEditExtension;
use ArdasBao\InlineEditBundle\Templating\Node\InlineEditorNode;

class InlineEditorTokenParser extends \Twig_TokenParser {

    protected $extension;

    public function __construct(InlineEditExtension $extension)
    {
        $this->extension = $extension;
    }

    public function parse(\Twig_Token $token)
    {
        $variableToken = $this->parser->getStream()->next();
        $variable = $variableToken->getValue();

        list($preset) = $this->parseArguments();

        $this->parser->getStream()->expect(\Twig_Token::BLOCK_END_TYPE);

        $defaultValue = $this->parser->subparse(array($this, 'decideBlockEnd'), true);
        $this->parser->getStream()->expect(\Twig_Token::BLOCK_END_TYPE);

        // @todo: check defaultValue type and throw exception if necessary.

        return new InlineEditorNode($variable, $defaultValue, $preset, $token->getLine(), $this->getTag(), $this->extension);
    }

    public function decideBlockEnd(\Twig_Token $token)
    {
        return $token->test('endhtmlvariableinlineeditor');
    }

    protected function parseArguments()
    {
        $stream = $this->parser->getStream();

        $preset = NULL;
        if ($stream->nextIf(\Twig_Token::NAME_TYPE, 'preset')) {
            $presetToken = $this->parser->getStream()->next();
            $preset = $presetToken->getValue();
        }

        return array($preset);
    }

    /**
     * Gets the tag name associated with this token parser.
     *
     * @return string The tag name
     */
    public function getTag()
    {
        return 'htmlvariableinlineeditor';
    }
}