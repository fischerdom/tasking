# Default entries for the databases


statuses = Status.create(
  [{ 
    title:         'Open' 
  } , { 
    title:         'Pending' 
  } , { 
    title:         'Finished' 
  } , { 
    title:         'Aborted' 
  }])
  

category = Category.create(
  [{ 
    title:         'Planing' 
  } , { 
    title:         'Developing' 
  } , { 
    title:         'Documentation' 
  } , { 
    title:         'Testing' 
  }])
  

users = User.create(
  [{ 
    first_name:         'Dominik',
    last_name:          'Fischer',
    email:              'dominik.fischer@stud.th-deg.de' 
  } , { 
    first_name:         'Michael',
    last_name:          'Alfranseder',
    email:              'michael.alfranseder@stud.th-deg.de' 
  } , { 
    first_name:         'Viktorrrr',
    last_name:          'Adler',
    email:              'viktor.adler@stud.th-deg.de' 
  } ])