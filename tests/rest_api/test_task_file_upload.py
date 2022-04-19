# Copyright (C) 2022 Intel Corporation
#
# SPDX-License-Identifier: MIT
import os.path
from http import HTTPStatus
import pytest

from .utils.config import get_method, post_method, patch_method


class TestUploadData:

    def _upload_taskfile_202_post(self, username, task_id, data, **kwargs):
        response = post_method(username, f'tasks/{task_id}/data', data, **kwargs)
        assert response.status_code == HTTPStatus.ACCEPTED

    def _create_task_201(self, username, spec, **kwargs):
        response = post_method(username, '/tasks', spec, **kwargs)
        assert response.status_code == HTTPStatus.CREATED
        return response.json()

    def _upload_annotations_202_post(self, username, task_id, data, **kwargs):
        response = post_method(username, f'tasks/{task_id}/annotations/', data, **kwargs)
        assert response.status_code == HTTPStatus.ACCEPTED

    def _get_task(self, username, task_id, **kwargs):
        response = get_method(username, f'/tasks/{task_id}', **kwargs)
        assert response.status_code == HTTPStatus.OK
        return response.json()

    @pytest.mark.parametrize('username, project_id', [('admin1', 1)])
    @pytest.mark.parametrize('method', ['post'])
    def test_upload_task_image(self, username, method, project_id, **kwargs):
        filename = 'video.avi'
        py_dir = os.path.dirname(__file__)
        media_dir = "media"
        mp4 = os.path.join(py_dir, media_dir, filename)

        task_spec = {
                'name': f'create a task for a file uploading, video, method is {method}',
                'project_id': project_id,
            }
        new_task = self._create_task_201(username, task_spec, **kwargs)
        task_id = new_task['id']

        data = {
            'filename': filename,
            'image_quality': 70,
            "compressed_chunk_type": "video",
        }

        with open(mp4, 'rb') as fp:
            kwargs['files'] = fp
            file_size = fp.seek(0,2)

        if method == 'post':
            self._upload_taskfile_202_post(username, task_id, data, **kwargs)
        elif method == 'tus':
            data.update([('chunk_size', 100), ("use_zip_chunks", False)])
            # todo: change this block
            with open(filename, 'wb+') as f:
                for chunk in filename.chunks():
                    f.write(chunk)


            self._test_create_task_202_patch(username, task_id, data, **kwargs)

        task_data = self._get_task(username, task_id, number=0, quality='compressed',type='preview')

    @pytest.mark.parametrize('username, project_id', [('admin1', 1)])
    @pytest.mark.parametrize('method', ['post'])
    def test_upload_task_annotations(self, username, method, project_id, **kwargs):
        filename = 'dataset.zip'
        py_dir = os.path.dirname(__file__)
        media_dir = "media"
        annotation_file = os.path.join(py_dir, media_dir, filename)

        task_spec = {
                'name': f'create a task for an annotation uploading, zip, method is {method}',
                'project_id': project_id,
            }
        new_task = self._create_task_201(username, task_spec, **kwargs)
        task_id = new_task['id']

        data = {
            'filename': filename,
        }

        with open(annotation_file, 'rb') as fp:
            kwargs['files'] = fp
            file_size = fp.seek(0,2)

        if method == 'post':
            self._upload_annotations_202_post(username, task_id, data, **kwargs)
        elif method == 'tus':
            data.update([('chunk_size', 100), ("use_zip_chunks", False)])
            self._test_create_task_202_patch(username, task_id, data, **kwargs)
