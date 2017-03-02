'use strict';

const _ = require('underscore');

const fs = require('fs');
const path = require('path');

const ULONG64 = require('number64').ULONG64;
const LONG64 = require('number64').LONG64;
const POINTER = require('ref-pointer');

const ref = require('ref');
const arch_x64 = (process.arch === 'x64');



const ffi_dbghelp = require('./ffi_dbghelp.js');
const ffi_kernel32 = require('./ffi_kernel32.js');

exports.GetCurrentProcess = ffi_kernel32.GetCurrentProcess;



function SymInitialize( arg_hProcess , arg_SearchPath , arg_InvadeProcess )
{
    var argv = Array.prototype.slice.call(arguments);
    
    var hProcess = null;
    var pszUserSearchPath = null;
    var fInvadeProcess = 0;

    var UserSearchPath = '';
    
    if ( 0 == argv.length )
    {
        hProcess = ffi_kernel32.GetCurrentProcess();
        pszUserSearchPath = null;
        fInvadeProcess = 0;
        UserSearchPath = '';
    }
    else
    {
        if ( !hProcess )
        {
            hProcess = ffi_kernel32.GetCurrentProcess();
        }
        else
        {
            hProcess = argv[0];
        }

        if ( argv.length > 1 )
        {
            if ( _.isArray( argv[1] ) )
            {
                if ( 0 != argv[1].length )
                {
                    UserSearchPath = argv[1].join(';');
                }
                else
                {
                    UserSearchPath = '';
                }
            }
            else if ( _.isString( argv[1] ) )
            {
                UserSearchPath = argv[1];
            }
            else
            {
                UserSearchPath = '';
            }
        }

        if ( argv.length > 2 )
        {
            if ( _.isBoolean( argv[2] ) )
            {   
                fInvadeProcess = argv[2] ? 1 : 0;
            }
            else if ( _.isNumber( argv[2] ) )
            {
                fInvadeProcess = ( 0 == argv[2] ? 0 : 1 );
            }
        }
    }

    if ( 0 != UserSearchPath.length )
    {
        pszUserSearchPath = Buffer.alloc( ( UserSearchPath.length + 1) * 2 ).fill(0);
        pszUserSearchPath.write( UserSearchPath , 0 , 'ucs2');
    }
    else
    {
        pszUserSearchPath = null;
    }

    return ( 0 != ffi_dbghelp.SymInitializeW( hProcess , pszUserSearchPath , fInvadeProcess ) );
}
exports.SymInitialize = SymInitialize;

function SymCleanup(  arg_hProcess )
{
    var argv = Array.prototype.slice.call(arguments);
    var hProcess = null;

    if ( 0 == argv.length )
    {
        hProcess = ffi_kernel32.GetCurrentProcess();
    }
    else
    {
        if ( !hProcess )
        {
            hProcess = ffi_kernel32.GetCurrentProcess();
        }
        else
        {
            hProcess = argv[0];
        }
    }

    return ( 0 != ffi_dbghelp.SymCleanup( hProcess ) );
}
exports.SymCleanup = SymCleanup;

function SymGetSymbolFile( arg_hProcess , arg_ImageFile , arg_Type  )
{
    var argv = Array.prototype.slice.call(arguments);
    var hProcess = null;

    var pszImageFile = null;
    var nType = 2;

    var pszSymbolFile = null;
    var nSymbolFileLength = 0;

    var pszDbgFile = null;
    var nDbgFileLength = 0;

    var nRet = 0;

    if ( 0 == argv.length )
    {
        hProcess = ffi_kernel32.GetCurrentProcess();
    }
    else
    {
        if ( !hProcess )
        {
            hProcess = ffi_kernel32.GetCurrentProcess();
        }
        else
        {
            hProcess = argv[0];
        }

        if ( argv.length >= 2 )
        {
            if ( ( _.isString( argv[1] ) ) && ( 0 != argv[1].length ) )
            {
                pszImageFile = Buffer.alloc( ( argv[1].length + 1) * 2 ).fill(0);
                pszImageFile.write( argv[1] , 0 , 'ucs2');    
            }
        }

        if ( argv.length >= 3 )
        {
            if ( _.isNumber( argv[2] ) )
            {
                nType = argv[2];
            }
            else if ( _.isString( argv[2] ) )
            {
                if ( 'exe' == argv[2] )
                {
                    nType = 0;
                }
                else if ( 'dbg' == argv[2] )
                {
                    nType = 1;
                }
                else if ( 'pdb' == argv[2] )
                {
                    nType = 2;
                }
            }
        }
    }

    nSymbolFileLength = 260;
    pszSymbolFile = Buffer.alloc( (nSymbolFileLength + 1)* 2 ).fill(0);

    nDbgFileLength = 260;
    pszDbgFile = Buffer.alloc( (nDbgFileLength + 1)* 2 ).fill(0);

    nRet =  ffi_dbghelp.SymGetSymbolFileW( 
        hProcess ,
        null ,
        pszImageFile ,
        nType ,
        pszSymbolFile ,
        nSymbolFileLength ,
        pszDbgFile ,
        nDbgFileLength 
     );

     if ( 0 == nRet )
     {
         return null;
     }

     var nLen = ffi_kernel32.lstrlenW( pszSymbolFile );
     if ( 0 == nLen )
     {
         return "";
     }

     return pszSymbolFile.toString( 'ucs2' , 0 , nLen  * 2 );
}
exports.SymGetSymbolFile = SymGetSymbolFile;

function SymGetSearchPath( arg_hProcess )
{
    var argv = Array.prototype.slice.call(arguments);
    var hProcess = null;
  
    var pszSearchPath = null;
    var nSearchPathLength = 0;

    if ( 0 == argv.length )
    {
        hProcess = ffi_kernel32.GetCurrentProcess();
    }
    else
    {
        if ( !hProcess )
        {
            hProcess = ffi_kernel32.GetCurrentProcess();
        }
        else
        {
            hProcess = argv[0];
        }
    }

    // The size of the SearchPath buffer, in characters.
    nSearchPathLength = 2048;
    pszSearchPath = Buffer.alloc( (nSearchPathLength + 1)* 2 ).fill(0);

    return ffi_dbghelp.SymGetSearchPathW( hProcess , pszSearchPath , nSearchPathLength );
}
exports.SymGetSearchPath = SymGetSearchPath;

function SymSetSearchPath( arg_hProcess , arg_SearchPath )
{
    var argv = Array.prototype.slice.call(arguments);
    var hProcess = null;
 
    var pszSearchPath = null;

    if ( 0 == argv.length )
    {
        hProcess = ffi_kernel32.GetCurrentProcess();
    }
    else
    {
        if ( !hProcess )
        {
            hProcess = ffi_kernel32.GetCurrentProcess();
        }
        else
        {
            hProcess = argv[0];
        }

        if ( argv.length > 1 )
        {   
            if ( _.isString( argv[1] ) )
            {
                if ( 0 == argv[1].length )
                {
                    pszSearchPath = null;
                }
                else
                {
                    pszSearchPath = Buffer.alloc( ( argv[1].length + 1) * 2 ).fill(0);
                    pszSearchPath.write( argv[1] , 0 , 'ucs2');
                }
            }
            else
            {
                pszSearchPath = null;
            }
        }
    }

    return ( 0 != ffi_dbghelp.SymSetSearchPathW( hProcess , pszSearchPath ) );
}
exports.SymSetSearchPath = SymSetSearchPath;

function SymLoadModuleFile( arg_hProcess , arg_ImageFile , arg_ModuleName , arg_ImageBase , arg_SizeOfImage )
{
    var argv = Array.prototype.slice.call(arguments);
    var hProcess = null;
  
    var pszImageName = null;
    var pszModuleName = null;
    var nBaseOfDll = ULONG64(0);
    var nSizeOfDll = 0;

    if ( 0 == argv.length )
    {
        hProcess = ffi_kernel32.GetCurrentProcess();
    }
    else
    {
        if ( !hProcess )
        {
            hProcess = ffi_kernel32.GetCurrentProcess();
        }
        else
        {
            hProcess = argv[0];
        }

        if ( argv.length >= 2 )
        {
            if ( _.isString( argv[1] ) && ( 0 != argv[1].length ) )
            {
                pszImageName = Buffer.alloc( ( argv[1].length + 1) * 1 ).fill(0);
                pszImageName.write( argv[1] , 0 , 'ascii');
            }
        }

        if ( argv.length >= 3 )
        {
            if ( _.isString( argv[2] ) && ( 0 != argv[2].length ) )
            {
                pszModuleName = Buffer.alloc( ( argv[2].length + 1) * 1 ).fill(0);
                pszModuleName.write( argv[2] , 0 , 'ascii');
            }
        }

        if ( argv.length >= 4 )
        {
            nBaseOfDll = ULONG64( argv[3] );
        }

        if ( argv.length >= 5 )
        {
            if ( _.isNumber( argv[4] ) )
            {
                nSizeOfDll = argv[4];
            }
        }
    }

    var api_ret = null;

    // dirty hack , fuck node-ffi's 64bit trans bug!
    // due to this bug , at arch_x86 , when you use 64bit imagebase , you will not got the right return value
    if ( arch_x64 )
    {
        api_ret = ffi_dbghelp.SymLoadModule64( 
            hProcess ,
            null  , 
            pszImageName ,
            pszModuleName , 
            POINTER( nBaseOfDll ) , 
            nSizeOfDll 
        );
    }
    else
    {
        api_ret = ffi_dbghelp.SymLoadModule64( 
            hProcess ,
            null  , 
            pszImageName ,
            pszModuleName , 
            nBaseOfDll.getLowPart() ,
            nBaseOfDll.getHighPart(), 
            nSizeOfDll 
        );
    }

    if ( arch_x64 )
    {
        return ULONG64( api_ret );
    }
    else
    {
        // hack ret , fuck node-ffi's 64bit trans bug!
        if ( 0 == api_ret )
        {
            return ULONG64(0);
        }

        return nBaseOfDll;
    }
}
exports.SymLoadModuleFile = SymLoadModuleFile;

function SymUnloadModule64( arg_hProcess , arg_ImageBase )
{
    var argv = Array.prototype.slice.call(arguments);
    var hProcess = null;
    var nBaseOfDll = ULONG64(0);
    var nRet = 0;

    if ( 0 == argv.length )
    {
        hProcess = ffi_kernel32.GetCurrentProcess();
    }
    else
    {
        if ( !hProcess )
        {
            hProcess = ffi_kernel32.GetCurrentProcess();
        }
        else
        {
            hProcess = argv[0];
        }

        if ( argv.length >= 2 )
        {
            nBaseOfDll = ULONG64( argv[1] );
        }
    }

    if ( arch_x64 )
    {
        nRet = ffi_dbghelp.SymUnloadModule64( 
            hProcess ,
            POINTER( nBaseOfDll )
        );
    }
    else
    {
        nRet =ffi_dbghelp.SymUnloadModule64( 
            hProcess , 
            nBaseOfDll.getLowPart() ,
            nBaseOfDll.getHighPart()
        );
    }

    return ( 0 != nRet );
}
exports.SymUnloadModule64 = SymUnloadModule64;

function SymGetSymFromAddr64(  )
{
    var argv = Array.prototype.slice.call(arguments);
    var hProcess = null;

    var nAddress = ULONG64(0);
    var lpDisplacement = null;

    var nSymbol64BufferSize = 0;
    var lpSymbol64 = null;
    var deref_lpSymbol64 = null;

    var MaxNameLength = 0;

    var nRet = 0;

    var api_ret = {};

    var lpSymbol64_name = null;

    if ( 0 == argv.length )
    {
        hProcess = ffi_kernel32.GetCurrentProcess();
    }
    else
    {
        if ( !hProcess )
        {
            hProcess = ffi_kernel32.GetCurrentProcess();
        }
        else
        {
            hProcess = argv[0];
        }

        if ( argv.length >= 2 )
        {
            nAddress = ULONG64( argv[1] );
        }
    }

    lpDisplacement = Buffer.alloc( 8 ).fill(0);

    MaxNameLength = 1024;

    nSymbol64BufferSize = ffi_dbghelp.SIZEOF_IMAGEHLP_SYMBOL64;
    nSymbol64BufferSize += ( MaxNameLength + 1 ) * 1;

    lpSymbol64 = Buffer.alloc( nSymbol64BufferSize ).fill(0);

    lpSymbol64.type = ffi_dbghelp.IMAGEHLP_SYMBOL64;
    deref_lpSymbol64 = lpSymbol64.deref();

    deref_lpSymbol64.SizeOfStruct = ffi_dbghelp.SIZEOF_IMAGEHLP_SYMBOL64;
    deref_lpSymbol64.MaxNameLength = MaxNameLength;

    if ( arch_x64 )
    {
        nRet = ffi_dbghelp.SymGetSymFromAddr64( 
            hProcess ,
            POINTER( nAddress ) ,
            lpDisplacement ,
            lpSymbol64  
        );
    }
    else
    {
        nRet = ffi_dbghelp.SymGetSymFromAddr64( 
            hProcess ,
            nAddress.getLowPart(),
            nAddress.getHighPart(),
            lpDisplacement ,
            lpSymbol64  
        );
    }

    if ( !nRet )
    {
        return null;
    }

    api_ret = {};

    lpSymbol64_name = ref.reinterpret( 
        lpSymbol64 , 
        MaxNameLength * 1 ,
        0x1C
    );

    var name_len = ffi_kernel32.lstrlenA( lpSymbol64_name );
    api_ret.name = lpSymbol64_name.toString('ascii' , 0 , name_len * 1 );

    api_ret.offset = ULONG64( 
            lpDisplacement.readUInt32LE( 0 ),
            lpDisplacement.readUInt32LE( 4 )
     );
 
    return api_ret;
}
exports.SymGetSymFromAddr64 = SymGetSymFromAddr64;

function SymGetNameFromAddr( arg_hProcess , arg_address )
{
    var argv = Array.prototype.slice.call(arguments);
    var hProcess = null;
    var address = 0;

    if ( 0 == argv.length )
    {
        hProcess = ffi_kernel32.GetCurrentProcess();
    }
    else
    {
        if ( !hProcess )
        {
            hProcess = ffi_kernel32.GetCurrentProcess();
        }
        else
        {
            hProcess = argv[0];
        }

        if ( argv.length >= 2 )
        {
            address =  argv[1];
        }
    }

    var sym = SymGetSymFromAddr64(hProcess , address );
    if  ( !sym )
    {
        return null;
    }

    if (  sym.offset.equals( 0 ) )
    {
        return sym.name;
    }
    else
    {
        return sym.name + '+0x' + sym.offset.toString(16);
    }
}
exports.SymGetNameFromAddr = SymGetNameFromAddr;

function SymGetSymFromName64(  )
{
    var argv = Array.prototype.slice.call(arguments);
    var hProcess = null;

    var pszSymbolName = null;;

    var nSymbol64BufferSize = 0;
    var lpSymbol64 = null;
    var deref_lpSymbol64 = null;

    var lpSymbol64_name = null;

    var MaxNameLength = 0;

    var nRet = 0;

    var api_ret = {};

    if ( 0 == argv.length )
    {
        hProcess = ffi_kernel32.GetCurrentProcess();
    }
    else
    {
        if ( !hProcess )
        {
            hProcess = ffi_kernel32.GetCurrentProcess();
        }
        else
        {
            hProcess = argv[0];
        }

        if ( argv.length >= 2 )
        {
            if ( _.isString( argv[1] ) && ( 0 != argv[1].length ) )
            {
                pszSymbolName = Buffer.alloc( ( argv[1].length + 1) * 1 ).fill(0);
                pszSymbolName.write( argv[1] , 0 , 'ascii');
            }
        }
    }

    MaxNameLength = 1024;

    nSymbol64BufferSize = ffi_dbghelp.SIZEOF_IMAGEHLP_SYMBOL64;
    nSymbol64BufferSize += ( MaxNameLength + 1 ) * 1;

    lpSymbol64 = Buffer.alloc( nSymbol64BufferSize ).fill(0);

    lpSymbol64.type = ffi_dbghelp.IMAGEHLP_SYMBOL64;
    deref_lpSymbol64 = lpSymbol64.deref();

    deref_lpSymbol64.SizeOfStruct = ffi_dbghelp.SIZEOF_IMAGEHLP_SYMBOL64;
    deref_lpSymbol64.MaxNameLength = MaxNameLength;

    nRet = ffi_dbghelp.SymGetSymFromName64( 
        hProcess ,
        pszSymbolName , 
        lpSymbol64  
    );

    if ( !nRet )
    {
        return null;
    }

    api_ret = {};

    lpSymbol64_name = ref.reinterpret( 
        lpSymbol64 , 
        MaxNameLength * 1 ,
        0x1C
    );

    var name_len = ffi_kernel32.lstrlenA( lpSymbol64_name );

    api_ret.name = lpSymbol64_name.toString('ascii' , 0 , name_len * 1 );
    api_ret.address = ULONG64( deref_lpSymbol64.Address );
    
    return api_ret;
}
// exports.SymGetSymFromName64 = SymGetSymFromName64;

function SymGetAddrFromName(  arg_hProcess , arg_name )
{
    var argv = Array.prototype.slice.call(arguments);
    var hProcess = null;
    var name = '';

    if ( 0 == argv.length )
    {
        hProcess = ffi_kernel32.GetCurrentProcess();
    }
    else
    {
        if ( !hProcess )
        {
            hProcess = ffi_kernel32.GetCurrentProcess();
        }
        else
        {
            hProcess = argv[0];
        }

        if ( argv.length >= 2 )
        {
            if ( _.isString( argv[1] ) )
            {
                 name =  argv[1];
            }
        }
    }

    var sym = SymGetSymFromName64(hProcess , name );
    if  ( !sym )
    {
        return null;
    }

    return sym.address;
}
exports.SymGetAddrFromName = SymGetAddrFromName;

function UnDecorateSymbolName(  )
{
    var argv = Array.prototype.slice.call(arguments);

    var pszDecoratedName = null;
    var pszUnDecoratedName = null;
    var nUndecoratedLength = 0;
    var nFlags = 0;

    if ( 0 == argv.length )
    {
        hProcess = ffi_kernel32.GetCurrentProcess();
    }
    else
    {
        if ( argv.length >= 1 )
        {
            if ( _.isString( argv[0] ) && ( 0 != argv[0].length ) )
            {
                pszDecoratedName = Buffer.alloc( ( argv[0].length + 1) * 2 ).fill(0);
                pszDecoratedName.write( argv[0] , 0 , 'ucs2');
            } 
        }

        if ( argv.length >= 2 )
        {
            if ( _.isNumber( argv[1] ) )
            {
                nFlags = argv[1];
            }
        }
    }

    // The size of the SearchPath buffer, in characters.
    nUndecoratedLength = 1024;
    pszUnDecoratedName = Buffer.alloc( (nUndecoratedLength + 1)* 2 ).fill(0);

    nUndecoratedLength = ffi_dbghelp.UnDecorateSymbolNameW( 
        pszDecoratedName ,
        pszUnDecoratedName , 
        nUndecoratedLength , 
        nFlags 
    );

    if ( 0 == nUndecoratedLength )
    {
        return "";
    }

    return pszUnDecoratedName.toString('ucs2' , 0 , nUndecoratedLength * 2 );
}
exports.UnDecorateSymbolName = UnDecorateSymbolName;


function main( argv )
{
    return 0;
}

if ( !module.parent )
{
    main( process.argv);
}