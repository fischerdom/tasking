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
