require "spec_helper"


# Tasklist Controller Unit-Test
describe TasklistsController, :type => :controller do

before do
  current_user = User.find(3)
end

#Update Tasklist Test  
  it "should can update an element" do
        put :update, :id => 9, :tasklist => {
          :user_id => 1,
          :name => "From Unit-Test"}

#Abfragen, ob Änderungen richtig       
        tasklist = Tasklist.find(9)
        expect(tasklist.user_id).to eq(1)
        expect(tasklist.name).to eq("From Unit-Test")
      end

  it "should can delete tasklist" do
    expect { delete :destroy, :id => 9 }.to change(Tasklist, :count)
  end
end