# windows dbghelp.dll wrapper for js

support api list

 * void* GetCurrentProcess();    
   

 * boolean SymInitialize( void* hProcess , string UserSearchPath , boolean InvadeProcess );   
    
    
 * boolean SymCleanup( void* hProcess );    
     
     
 * string SymGetSymbolFile( void* hProcess , string ImageFile , string SymbolType);   
     
     
 * string SymGetSearchPath( void* hProcess );    
   
   
 * boolean SymSetSearchPath( void* hProcess , string UserSearchPath  );   
     
     
 * ULONG64 SymLoadModuleFile( void* hProcess , string ImageFile , string ModuleName , ULONG64 ImageBase , int SizeOfImage ); 
       
       
 * boolean SymUnloadModule64( void* hProcess , ULONG64 ImageBase );   
    
    
 * string SymGetNameFromAddr( void* hProcess , ULONG64 address );   
    
    
 * ULONG64 SymGetAddrFromName( void* hProcess , string name );  
     
     
 * string UnDecorateSymbolName( string name );   
    

And here's some code:

```javascript
var dbghelp = require('dbghelp.js');
	
var BinFile = "D:/win32k/win32kbase.sys";
var PdbFile = '';

var hProcess = null;
var pWin32kBase = null;

dbghelp.SymInitialize( hProcess , 'c:/symbols' , false );

PdbFile = dbghelp.SymGetSymbolFile( hProcess , BinFile )
    
printf('[SymGetSymbolFile]  %s \n' , PdbFile );

pWin32kBase = dbghelp.SymLoadModuleFile( hProcess , BinFile );

printf('[SymLoadModuleFile]  %s \n' , pWin32kBase );

var a = dbghelp.SymGetAddrFromName(hProcess , "gpW32FastMutex" );

printf( "gpW32FastMutex = %p \n" , a );

dbghelp.SymGetNameFromAddr(hProcess , a );

dbghelp.SymCleanup( hProcess );
```


