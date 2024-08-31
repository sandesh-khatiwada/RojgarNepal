import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './../css/pageCss/AdminLogIn.css';
import { useNavigate } from 'react-router-dom';
import logo from './../images/LOGO.png';

const validationSchema = Yup.object().shape({
  id: Yup.string()
    .required('ID is required'),
  password: Yup.string()
    .required('Password is required')
});

const AdminLogIn = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await fetch('http://localhost:5000/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      console.log(response);
      const data = await response.json();

      console.log(data)
      localStorage.setItem('token', data.token);
      navigate('/admin-user'); // Replace with the correct route to the admin dashboard
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="alogin-container">
      <div className="alogin-header">
        <img src={logo} alt="RojgarNepal Logo" className="alogo" />
      </div>
      <div className="alogin-form">
        <h2>Admin LogIn To <span className='arojgar-np'>RojgarNepal</span></h2>
        <Formik
          initialValues={{ id: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors }) => (
            <Form>
              <div className="aform-group">
                <ErrorMessage name="id" component="div" className="aerror-message" />
                <Field type="text" name="id" placeholder="Enter ID" className="aform-controli" />
              </div>
              <div className="aform-group">
                <ErrorMessage name="password" component="div" className="aerror-message" />
                <Field type="password" name="password" placeholder="Enter Password" className="aform-controlp" />
                <div className="apassword-info">
               
             
                </div>
              </div>
              {errors.general && <div className="aerror-message">{errors.general}</div>}
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
