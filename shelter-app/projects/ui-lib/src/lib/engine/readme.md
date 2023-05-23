This module provides service of  main logic of this application:
- what is displayed
- when is displayed
- how does it interact

How translate URI path to Engine model:
 - /path1/path2
   - field "path2" of child model2
   - second slash field "index" of child model2
   - field "path1" of parent model1
   - first slash field "index" of parent model1
On start:
- Init service with default EngineModel, by default it is an object 
with only one property index like {index: "load default EngineModel"}
- URL '/'
  - until field index contain "load EngineModel" - load and store to default
- URL '/something' 
  - until field index contain "load EngineModel" - load and store to default
  - until field something contain "load default EngineModel" - load and store to field something
- Handle requested URL: http://localhost:4200/path1;path10=/path2;path20=/path3?par1=0&par2=2
  - if field index contain "load default EngineModel" - load and merge to default
  - return field path1
  
EngineModel це json object.
Розглянемо EngineModel як json object з property яке відпоідає за надання EngineModel 
 
