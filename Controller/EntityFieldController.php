<?php
/**
 * User: taldy
 * Date: 27.02.15
 * Time: 20:49
 */

namespace ArdasBao\InlineEditBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class EntityFieldController
 * @package ArdasBao\InlineEditBundle\Controller
 *
 * @Route("/baoinlineedit/entity-field")
 */
class EntityFieldController  extends Controller {

    /**
     * @Route("/", name="baoinlineeditor_entity_field_update")
     * @Method("POST")
     *
     * @param Request $request
     * @return Response
     */
    public function updateAction(Request $request)
    {
        $result = '';

        try {
            $requestData = json_decode($request->getContent());
            if (empty($requestData->entityType) || empty($requestData->entityId) || empty($requestData->fieldName)) {
                throw new \Exception('Incorrect request.');
            } else {
                $entityType = $requestData->entityType;
                $entityId = $requestData->entityId;
                $fieldName = $requestData->fieldName;
            }

            $status = FALSE;
            if (($entityType) && ($entityId) && ($fieldName)) {
                $em = $this->getDoctrine()->getManager();
                $entity = $em->getRepository($entityType)->find($entityId);
                $fieldNameUcfirst = ucfirst($fieldName);
                $setter = 'set' . $fieldNameUcfirst;
                if(method_exists($entity, $setter)) {
                    $entity->$setter($requestData->value);
                    $em->persist($entity);
                    $em->flush();
                    $status = TRUE;
                }
            }

            $result = $status ? new JsonResponse(array('status' => $status)) : new JsonResponse(array('status' => $status), 500);
        }
        catch(\Exception $e) {
            $responseData = array(
                'status' => FALSE,
                'message' => $e->getMessage()
            );

            $result = new JsonResponse($responseData, 500);
        }

        return $result;
    }
}