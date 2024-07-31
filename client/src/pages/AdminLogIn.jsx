import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './../css/pageCss/AdminLogIn.css';

import logo from './../images/LOGO.png'

const validationSchema = Yup.object().shape({
  id: Yup.string()
    .required('ID is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

const AdminLogIn = () => {
  const handleSubmit = (values) => {
    console.log(values);
  };

  return (
    <div className="alogin-container">
      <div className="alogin-header">
        <img src={logo} alt="RojgarNepal Logo" className="alogo" />
        
      </div>
      <div className="alogin-form">
        <h2>Admin LogIn To <span className='arojgar-np'> RojgarNepal</span></h2>
        <Formik
          initialValues={{ id: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="aform-group">
              <ErrorMessage name="id" component="div" className="aerror-message" />
                <Field type="text" name="id" placeholder="Enter ID" className="aform-controli" />
               
              </div>
              <div className="aform-group">
              <ErrorMessage name="password" component="div" className="aerror-message" />
                <Field type="password" name="password" placeholder="Enter Password" className="aform-controlp" />
                
                <div className="apassword-info">
                  <span>Minimum of 8 characters</span>
                  <a href="/forgot-password" className="aforgot-password">Forgot Password?</a>
                </div>
              </div>
              <button type="submit" className="alogin-button" disabled={isSubmitting}>
                LogIn
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AdminLogIn;
