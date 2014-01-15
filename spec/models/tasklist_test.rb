require "spec_helper"

#Check values in the database
describe Tasklist do
  it "proves values" do
    testlist1 = Tasklist.create!(user_id: 3, name: "Unit-Test-List")
    expect(testlist1.user_id).to eq(3)
    expect(testlist1.name).to eq("Unit-Test-List")
    expect(testlist1.closed).to eq(nil)
    expect(testlist1.king_id).to eq(nil)
  end

# Check user_id validation  
  it "should not save post without name" do
    subject.should have(1).error_on(:user_id)
  end

# Check name validation 
  it "should not save post without name" do
    subject.should have(1).error_on(:name)
  end
end