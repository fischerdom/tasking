require "spec_helper"
# Task Controller Unit-Test
describe TasksController, :type => :controller do

  it "should can create a task" do
        post :create, :format => 'json', :task => {
          :id => 1,
          :tasklist_id => 1,
          :category_id => 1,       
          :status_id => 1,
# Assigned_to kann nicht getestet werden, da Unit-Test keine FB-Benachrichtigung schicken kann 
          :title => "Unit-Title",
          :description => "Unit-Description",
          :pointvalue  => 1,
          :due_date => "2014-01-01 01:01",
          :etc => 1 
          }
          
   puts Rails.env      
#Abfragen, ob Änderungen richtig       
        task = Task.all.last
        expect(task.tasklist_id).to eq(1)
        expect(task.category_id).to eq(1)
        expect(task.status_id).to eq(1)
#        expect(task.assigned_to).to eq(1)
        expect(task.title).to eq("Unit-Title")
        expect(task.description).to eq("Unit-Description")
        expect(task.pointvalue).to eq(1)
        expect(task.due_date).to eq("2014-01-01 01:01")
        expect(task.etc).to eq(1)
      end

#Update Task Test  
  it "should can update a task" do
        put :update, :id => 16, :task => {
          :tasklist_id => 2,
          :category_id => 2,
# Assigned_to und status_id kann nicht getestet werden, da Unit-Test keine FB-Benachrichtigung schicken kann          
#          :status_id => 2,
#          :assigned_to => 2,
          :title => "Unit-Title",
          :description => "Unit-Description",
          :pointvalue  => 2,
          :due_date => "2014-02-02 02:02",
          :etc => 2 }
          
#Abfragen, ob Änderungen richtig       
        task = Task.find(16)
        expect(task.tasklist_id).to eq(2)
        expect(task.category_id).to eq(2)
#        expect(task.status_id).to eq(2)
#        expect(task.assigned_to).to eq(2)
        expect(task.title).to eq("Unit-Title")
        expect(task.description).to eq("Unit-Description")
        expect(task.pointvalue).to eq(2)
        expect(task.due_date).to eq("2014-02-02 02:02")
        expect(task.etc).to eq(2)
      end
end

describe TasksController, :type => :controller do

  it "should can delete task" do
    expect { delete :destroy, :id => 16 }.to change(Task, :count)
  end
end