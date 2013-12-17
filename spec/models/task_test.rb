require "spec_helper"

describe Task do
  
#Testen, ob alle Werte richtig in die Datenbank gespeichert werden.
  it "proves values" do
    test1 = Task.create!(tasklist_id: 1, category_id: 1, status_id: 1, assigned_to: 3, title: "Unit-Test", pointvalue: 1, etc: 1, due_date: "2014-01-01 00:00:00")
    expect(test1.tasklist_id).to eq(1)
    expect(test1.category_id).to eq(1)
    expect(test1.status_id).to eq(1)
    expect(test1.assigned_to).to eq(3)
    expect(test1.title).to eq("Unit-Test")
    expect(test1.pointvalue).to eq(1)
    expect(test1.due_date).to eq("2014-01-01 00:00:00")
    expect(test1.etc).to eq(1)
  end

# Testen der Pflichtfeldvalidierung Tasklist  
  it "should not save Task without tasklist_id" do
    subject.should have(1).error_on(:tasklist_id)
  end
  
# Testen der Pflichtfeldvalidierung Category  
    it "should not save Task without category_id" do
    subject.should have(1).error_on(:category_id)
  end
 
# Testen der Pflichtfeldvalidierung Status  
    it "should not save Task without status_id" do
    subject.should have(1).error_on(:status_id)
  end  

# Testen der Pflichtfeldvalidierung Title  
    it "should not save Task without title" do
    subject.should have(1).error_on(:title)
  end 

# Testen der Pflichtfeldvalidierung Pointvalue  
    it "should not save Task without pointvalue" do
    subject.should have(1).error_on(:pointvalue)
  end  
  
# Testen der Pflichtfeldvalidierung Due_Date  
    it "should not save Task without due_date" do
    subject.should have(1).error_on(:due_date)
  end  
end