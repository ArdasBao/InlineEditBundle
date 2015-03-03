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
 * Class VariableController
 * @package ArdasBao\InlineEditBundle\Controller
 *
 * @Route("/baoinlineedit/variable")
 */
class VariableController  extends Controller {

    /**
     * @Route("/", name="baoinlineeditor_variable_update")
     * @Method("POST")
     *
     * @param Request $request
     * @return Response
     */
    public function updateAction(Request $request)
    {
        try {
            $requestData = json_decode($request->getContent());
            if (empty($requestData->name)) {
                throw new \Exception('Incorrect request.');
            }

            if ($requestData->name) {
                $this->get('ardas.variables.service')->set($requestData->name, $requestData->value);
            }

            return new JsonResponse(array('status' => TRUE));
        }
        catch(\Exception $e) {
            $responseData = array(
                'status' => FALSE,
                'message' => $e->getMessage()
            );

            return new JsonResponse($responseData, 500);
        }
    }
}