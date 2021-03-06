<?php
/**
 * User: schernenko
 * Date: 26.09.14
 * Time: 12:17
 * To change this template use File | Settings | File Templates.
 */

namespace ArdasBao\InlineEditBundle\Templating;

use ArdasBao\InlineEditBundle\Services\InlineEditor;
use ArdasBao\InlineEditBundle\Templating\TokenParser\InlineEditorTokenParser;

class InlineEditExtension extends \Twig_Extension
{
    protected $inlineEditor;

    public function __construct(InlineEditor $inlineEditor)
    {
        $this->inlineEditor = $inlineEditor;
    }

    public function getFunctions()
    {
        return array(
            'getInlineEditableVariable' => new \Twig_Function_Method($this, 'getInlineEditableVariable'),
            'getInlineEditableHTMLVariable' => new \Twig_Function_Method($this, 'getInlineEditableHTMLVariable'),
            'getInlineEditableEntityField' => new \Twig_Function_Method($this, 'getInlineEditableEntityField'),
            'isInlineEditAllowed' => new \Twig_Function_Method($this, 'isInlineEditAllowed'),
        );
    }

    public function getTokenParsers()
    {
        return array(new InlineEditorTokenParser($this));
    }

    /**
     * Return variable value wrapped for client-side inline editor if inline editing is allowed for current user, and
     * simple variable value if doesn't.
     *
     * @param $name
     * @param string $type
     * @param null $defaultValue
     * @return null|string
     */
    public function getInlineEditableVariable($name, $type = 'text', $defaultValue = NULL)
    {
        $value = $this->getInlineEditor()->get($name);
        if (empty($value)) {
            $value = $defaultValue;
        }

        if ($this->getInlineEditor()->isInlineEditAllowed()) {
            return '<span data-baoinlineeditor-variable="' . $name . '" data-baoinlineeditor-type="' . $type . '">' . $value . '</span>';
        }
        else {
            return $value;
        }
    }

    /**
     * Return variable value wrapped for client-side inline editor if inline editing is allowed for current user, and
     * simple variable value if doesn't.
     *
     * Also if variable doesn't have value in database and default value in config
     * $defaultValue parameter will be used instead.
     *
     * @param $name
     * @param bool $defaultValue
     * @return bool|string
     */
    public function getInlineEditableHTMLVariable($name, $defaultValue = NULL, $preset = NULL)
    {
        $value = $this->getInlineEditor()->get($name);
        if (empty($value)) {
            $value = $defaultValue;
        }

        if ($this->getInlineEditor()->isInlineEditAllowed()) {
            return '<div data-baoinlineeditor-variable="' . $name . '" data-baoinlineeditor-type="ckeditor" data-ck-inlineeditor-preset="' . $preset . '">' . $value . '</div>';
        }
        else {
            return $value;
        }
    }

    /**
     * Return entity field value wrapped for client-side inline editor if inline editing is allowed for current user, and
     * simple entity field value if doesn't.
     *
     * @param $entity
     * @param $fieldName
     * @param string $type
     * @param null $preset
     * @return null|string
     */
    public function getInlineEditableEntityField($entity, $fieldName, $type = 'text', $preset = NULL)
    {
        $result = '';
        $entityType = get_class($entity);
        $fieldNameUcfirst = ucfirst($fieldName);
        $getterGet = 'get' . $fieldNameUcfirst;
//        $getterIs  = 'is' . $fieldNameUcfirst;

        if(method_exists($entity, $getterGet)) {
            $value = $entity->$getterGet();
        }
//       @todo support boolean fields with 'is' getter
//        elseif(method_exists($entity, $getterGet)) {
//            $value = $entity->$getterIs();
//        }

        if ($this->getInlineEditor()->isInlineEditAllowed()) {
            if ($type == 'text') {
                $result = '<span data-baoinlineeditor-entity-field data-baoinlineeditor-entity-type="' . $entityType . '" data-baoinlineeditor-entity-id="' . $entity->getId() . '" data-baoinlineeditor-field-name="' . $fieldName . '" data-baoinlineeditor-type="' . $type . '">' . $value . '</span>';
            } else if ($type == 'ckeditor') {
                $result = '<span data-baoinlineeditor-entity-field data-baoinlineeditor-entity-type="' . $entityType . '" data-baoinlineeditor-entity-id="' . $entity->getId() . '" data-baoinlineeditor-field-name="' . $fieldName . '" data-baoinlineeditor-type="' . $type . '"  data-ck-inlineeditor-preset="' . $preset . '">' . $value . '</span>';
            }
        }
        else {
            $result =  $value;
        }

        return $result;
    }

    /**
     * Return TRUE if inline editing is allowed for logged in user.
     *
     * @return bool
     */
    public function isInlineEditAllowed()
    {
        return $this->getInlineEditor()->isInlineEditAllowed();
    }

    /**
     * @return InlineEditor
     */
    public function getInlineEditor()
    {
        return $this->inlineEditor;
    }

    public function getName()
    {
        return 'ardasbao_inlineeditor_extension';
    }

}