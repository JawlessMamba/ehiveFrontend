import * as yup from "yup";

export const ProfileFormschema = yup.object({
name: yup.string(),
username: yup.string()
});


export const ChangePasswordschema = yup.object({
new_pass: yup.string().required('New Password is required'),
password: yup.string().required('Confirm Password is required')
})


export const ChooseProfileschema = yup.object({
userName: yup.string()
.required('Username is required.')
})

export  const ForgotPasswordschema = yup.object({
email: yup.string()
.email('Please enter a valid email address').required('Email is required')
})


export const Freelancer_Typeschema = yup.object({
userName: yup.string()
.required('Username is required.')
})

export const Freelancing_Experienceschema = yup.object({
userName: yup.string()
.required('Username is required.')
})


export const Servicesschema = yup.object({
  userName: yup.string()
      .required('Username is required.')
})


export const SignUpschema = yup.object({
name: yup.string().required('Name is required'),
email: yup.string()
.email('Please enter a valid email address')
.required('Email is required')
,
password: yup.string()
// .min(6, 'Password must be at least 6 characters')
// .max(20, 'Password cannot exceed 20 characters')
// .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
// .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
// .matches(/[0-9]/, 'Password must contain at least one number')
// .matches(/[@$!%*?&#]/, 'Password must contain at least one special character')
// .required('Password is required')
,
})

export const Start_Journeyschema = yup.object({
  userName: yup.string()
  .required('Username is required.')
})
export  const Total_Empschema = yup.object({
  userName: yup.string()
  .required('Username is required.')
  })


  export   const VerifyOtpschema = yup.object({
    otp1: yup.string().required(),
    otp2: yup.string().required(),
    otp3: yup.string().required(),
    otp4: yup.string().required()
  });


  export const descriptionschema = yup.object({
    description: yup.string().required("Description is required"),
  });


  export const Overviewschema = yup.object({
    gigsTitle: yup.string().required("title not selected"),
    category: yup.string().required("category not selected"),
    subCategory: yup.string().required("sub category not selected"),
  })




  export const Loginschema = yup.object({
    email: yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
    password: yup.string()
  });

 
  export const FreelancerProfileschema = yup.object({
    name: yup.string(),
    gigs: yup.string()
  })

                  


