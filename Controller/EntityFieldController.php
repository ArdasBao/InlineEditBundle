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
use Ardas\FileManagerBundle\Entity\File;

/**
 * Class EntityFieldController
 * @package ArdasBao\InlineEditBundle\Controller
 *
 * @Route("/baoinlineedit/entity-field")
 */
class EntityFieldController  extends Controller {

    const STORE_FOLDER = 'images/';

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

    /**
     * @Route("/upload-entity-image/{entityType}/{fieldName}/{entityId}/{uploaderKey}/{preset}", defaults={"preset" = NULL})
     * @Method({"POST"});
     */
    public function fileUploadAction($entityType, $fieldName, $entityId, $uploaderKey, $preset = NULL)
    {
        $entityTypeArr = explode('-', $entityType);
        $entityTypeName = end($entityTypeArr);
        $entityTypeFullName = implode('\\', $entityTypeArr);

        /** @var FileUploader $fileUploader */
        $fileUploader = $this->get('ardas.file_uploader');
        $uploadImgUrlPart = "$entityTypeName/$uploaderKey/";
        $fileUploader->removeFolder($fileUploader->getTmpPath() . $uploadImgUrlPart);
        if (!empty($preset)) {
            $files = $fileUploader->storeTmpFile('files', $uploadImgUrlPart . "image/", array(
                'image_thumbnail_preset' => $preset
            ));
        } else {
            $files = $fileUploader->storeTmpFile('files', $uploadImgUrlPart . "image/");
        }
        $file = reset($files);

        $tmpFolder = $fileUploader->getTmpPath() . $uploadImgUrlPart . "image/";
        $em = $this->getDoctrine()->getManager();

        $entity =  $em->getRepository($entityTypeFullName)->find($entityId);
        if (!empty($file['filename'])) {
            $fieldNameUcFirst = ucfirst($fieldName);
            $getterGet = 'get' . $fieldNameUcFirst;
            $setterSet = 'set' . $fieldNameUcFirst;
            if (method_exists($entity, $getterGet)) {
                $image = $entity->$getterGet();
            }
            $imageClassName = $em->getClassMetadata($entityTypeFullName)->getAssociationTargetClass($fieldName);
            if ($image instanceof $imageClassName) {
                $image->updateFileFromTmp($file['filename'], $tmpFolder);
            }
            else {
                $image = $this->createEntityImageFromTmpFile($entity, $file['filename'], $tmpFolder, $imageClassName);
            }

            $em->persist($image);
            $entity->$setterSet($image);
            $file['url'] = $image->getWebPath();
            if (!empty($preset)) {
                $file['thumbnailUrl'] = $fileUploader->generateImageThumbnailUrl($image->getWebPath(), $preset);
            } else {
                $file['thumbnailUrl'] = $image->getWebPath();
            }

        }

        $em->persist($entity);
        $em->flush();

        return new Response(json_encode($file));
    }

    /**
     * Creates object and takes care about creating File entity.
     *
     * @param $entity
     * @param string $filename
     * @param string $tmpFolder
     * @param string $imageClassName
     * @return Object
     */
    protected function createEntityImageFromTmpFile($entity, $filename, $tmpFolder, $imageClassName)
    {
        $file = new File($filename, $tmpFolder, self::STORE_FOLDER);
        $entityImage = new $imageClassName($entity, $file);
        return $entityImage;
    }
}