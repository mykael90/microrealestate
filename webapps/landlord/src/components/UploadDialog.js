import * as Yup from 'yup';

import { Box, DialogTitle, Grid } from '@material-ui/core';
import {
  CancelButton,
  DateField,
  SelectField,
  SubmitButton,
  UploadField,
} from './Form';
import { Form, Formik, useFormikContext } from 'formik';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import moment from 'moment';
import { StoreContext } from '../store';
import { toJS } from 'mobx';
import { uploadDocument } from '../utils/fetch';
import { useToast } from '../utils/hooks';
import useTranslation from 'next-translate/useTranslation';

// TODO: constants to shate between frontend and backend
const MAX_FILE_SIZE = 2_097_152; // 2Go
const SUPPORTED_MIMETYPES = [
  'image/gif',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/jpe',
  'application/pdf',
];
const validationSchema = Yup.object().shape({
  template: Yup.object().required(),
  description: Yup.string(),
  file: Yup.mixed()
    .nullable()
    .required()
    .test(
      'MAX_FILE_SIZE',
      'File is too big. Maximum size is 2Go.',
      (value) => value && value.size <= MAX_FILE_SIZE
    )
    .test(
      'FILE_FORMAT',
      'File is not allowed. Only images or pdf are accepted.',
      (value) => value && SUPPORTED_MIMETYPES.includes(value.type)
    ),
  expiryDate: Yup.mixed()
    .when('template', (template, schema) => {
      return template?.hasExpiryDate ? schema.required() : schema;
    })
    .test('expiryDate', 'Date is invalid', (value) => {
      if (value) {
        return moment(value).isValid();
      }
      return true;
    }),
});

const initialValues = {
  template: '',
  description: '',
  file: '',
  expiryDate: null,
};

const FormDialog = ({ open, onClose, children }) => {
  const { isSubmitting, resetForm } = useFormikContext();

  const handleClose = useCallback(
    (e) => {
      resetForm();
      onClose && onClose(e);
    },
    [onClose, resetForm]
  );

  return (
    <Dialog
      maxWidth="sm"
      fullWidth
      open={!!open}
      onClose={handleClose}
      disableEscapeKeyDown={isSubmitting}
    >
      {children}
    </Dialog>
  );
};

export default function UploadDialog({ open, setOpen, onSave }) {
  const { t } = useTranslation('common');
  const store = useContext(StoreContext);
  const [Toast, setToastMessage] = useToast();
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const uploadTemplates = store.template.items
      .filter((template) => template.type === 'fileDescriptor')
      .map((template) => ({
        id: template._id,
        label: template.name,
        description: template.description,
        value: toJS(template),
      }));
    setTemplates(uploadTemplates);
  }, [store.template.items]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const _onSubmit = useCallback(
    async (doc, { resetForm }) => {
      doc.name = doc.template.name;
      doc.description = doc.template.description;
      doc.mimeType = doc.file.type;
      try {
        const response = await uploadDocument({
          endpoint: '/documents/upload',
          documentName: doc.template.name,
          file: doc.file,
          folder: 'contract_scanned_documents',
        });

        doc.url = response.data.key;
        doc.versionId = response.data.versionId;
      } catch (error) {
        console.error(error);
        setToastMessage(t('Cannot upload document'));
        return;
      }
      handleClose();
      try {
        await onSave(doc);
        resetForm();
      } catch (error) {
        console.error(error);
        setToastMessage(t('Cannot save document'));
      }
    },
    [
      //t,
      handleClose,
      onSave,
      setToastMessage,
    ]
  );

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={_onSubmit}
      >
        {({ isSubmitting, values }) => {
          return (
            <FormDialog open={open} onClose={handleClose}>
              <DialogTitle>{t('Document to upload')}</DialogTitle>
              <Box p={1}>
                <Form autoComplete="off">
                  <DialogContent>
                    <Grid container>
                      <Grid item xs={12}>
                        <SelectField
                          label={t('Document')}
                          name="template"
                          values={templates}
                        />
                      </Grid>
                      {values.template?.hasExpiryDate && (
                        <Grid item xs={12}>
                          <DateField
                            label={t('Expiry date')}
                            name="expiryDate"
                          />
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <UploadField name="file" />
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <CancelButton label={t('Cancel')} onClick={handleClose} />
                    <SubmitButton
                      label={!isSubmitting ? t('Upload') : t('Uploading')}
                    />
                  </DialogActions>
                </Form>
              </Box>
            </FormDialog>
          );
        }}
      </Formik>
      <Toast severity="error" />
    </>
  );
}
