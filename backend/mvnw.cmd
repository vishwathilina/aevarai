@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.2
@REM
@REM Optional ENV vars
@REM   JAVA_HOME - location of a JDK home dir
@REM   MVNW_REPOURL - repo url base for downloading maven distribution
@REM   MVNW_USERNAME/MVNW_PASSWORD - user and password for downloading maven
@REM   MVNW_VERBOSE - true: enable verbose log
@REM ----------------------------------------------------------------------------

@REM Begin all REM://sym-block
@echo off
@REM set title of command window
title %0
@REM enable extensions
setlocal enableextensions

set MVNW_USERNAME=
set MVNW_PASSWORD=

@REM SET MAVEN_PROJECTBASEDIR to the fully qualified path to where the pom.xml is located
SET MAVEN_PROJECTBASEDIR=%~dp0

@REM Look for the existence of the maven wrapper java file
IF NOT EXIST "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties" (
    echo Missing %MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties, download a new copy from https://maven.apache.org/wrapper/
    goto error
)

@REM ==== JAVA_HOME VALIDATION ====
:javaHomeExist
IF NOT "%JAVA_HOME%"=="" (
    IF NOT EXIST "%JAVA_HOME%\bin\java.exe" (
        echo JAVA_HOME is set to an invalid directory [%JAVA_HOME%].
        echo JAVA_HOME = %JAVA_HOME%
        echo Please fix the JAVA_HOME variable in your environment.
        goto error
    )
    set JAVACMD="%JAVA_HOME%\bin\java.exe"
) ELSE (
    for %%i in (java.exe) do set JAVACMD="%%~$PATH:i"
    IF "%JAVACMD%"=="""" (
        echo.
        echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
        echo.
        echo Please set the JAVA_HOME variable in your environment to match the
        echo location of your Java installation.
        echo.
        goto error
    )
)

@REM ==== CREATE MAVEN_OPTS ====
IF NOT "%MAVEN_OPTS%"=="" SET MAVEN_OPTS=-Xmx512m

@REM ==== MAVEN_USER_HOME ====
IF "%MAVEN_USER_HOME%"=="" SET MAVEN_USER_HOME=%USERPROFILE%\.m2

@REM ==== READ DISTRIBUTION URL and SHA256 ====
set DISTRIBUTIONURL=
set DISTRIBUTIONSHA256SUM=
FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties") DO (
    IF "%%A"=="distributionUrl" SET DISTRIBUTIONURL=%%B
    IF "%%A"=="distributionSha256Sum" SET DISTRIBUTIONSHA256SUM=%%B
)

IF "%DISTRIBUTIONURL%"=="" (
    echo Error: distributionUrl is not found within %MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties
    goto error
)

@REM ==== CALCULATE MAVEN_HOME ====
FOR %%A IN ("%DISTRIBUTIONURL%") DO SET DISTNAME=%%~nxA
SET DISTNAME=%DISTNAME:-bin.zip=%
SET DISTNAME=%DISTNAME:-bin.tar.gz=%

SET MAVEN_HOME=%MAVEN_USER_HOME%\wrapper\dists\%DISTNAME%

IF EXIST "%MAVEN_HOME%\bin\mvn.cmd" goto runMaven

@REM ==== DOWNLOAD MAVEN ====
IF NOT EXIST "%MAVEN_HOME%" mkdir "%MAVEN_HOME%"

SET DOWNLOAD_URL=%DISTRIBUTIONURL%
IF NOT "%MVNW_REPOURL%"=="" SET DOWNLOAD_URL=%MVNW_REPOURL%/%DISTRIBUTIONURL:*://=%

echo Downloading from: %DOWNLOAD_URL%
echo Downloading to: %MAVEN_HOME%\%DISTNAME%-bin.zip

powershell -Command "&{"^
    "$webclient = new-object System.Net.WebClient;"^
    "if (-not ([string]::IsNullOrEmpty('%MVNW_USERNAME%') -and [string]::IsNullOrEmpty('%MVNW_PASSWORD%'))) {"^
    "$webclient.Credentials = new-object System.Net.NetworkCredential('%MVNW_USERNAME%', '%MVNW_PASSWORD%');"^
    "}"^
    "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $webclient.DownloadFile('%DOWNLOAD_URL%', '%MAVEN_HOME%\%DISTNAME%-bin.zip')"^
    "}"
if "%ERRORLEVEL%" NEQ "0" (
    echo Failed to download %DOWNLOAD_URL%
    goto error
)

@REM ==== VERIFY SHA256 ====
IF NOT "%DISTRIBUTIONSHA256SUM%"=="" (
    echo Verifying checksum...
    powershell -Command "&{"^
        "$hash = (Get-FileHash -Path '%MAVEN_HOME%\%DISTNAME%-bin.zip' -Algorithm SHA256).Hash.ToLower();"^
        "if ($hash -ne '%DISTRIBUTIONSHA256SUM%') {"^
        "Write-Host 'Checksum mismatch';"^
        "exit 1;"^
        "}"^
        "}"
    if "%ERRORLEVEL%" NEQ "0" (
        echo Checksum verification failed
        del "%MAVEN_HOME%\%DISTNAME%-bin.zip"
        goto error
    )
)

@REM ==== UNZIP ====
echo Extracting...
powershell -Command "Expand-Archive -Path '%MAVEN_HOME%\%DISTNAME%-bin.zip' -DestinationPath '%MAVEN_HOME%' -Force"
if "%ERRORLEVEL%" NEQ "0" (
    echo Failed to extract %MAVEN_HOME%\%DISTNAME%-bin.zip
    goto error
)

@REM ==== MOVE MAVEN FILES ====
FOR /D %%G IN ("%MAVEN_HOME%\apache-maven-*") DO (
    xcopy "%%G\*" "%MAVEN_HOME%\" /E /Q /Y >NUL
    rmdir "%%G" /S /Q
)

del "%MAVEN_HOME%\%DISTNAME%-bin.zip"

:runMaven
"%MAVEN_HOME%\bin\mvn.cmd" %*
if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

cmd /C exit /B %ERROR_CODE%
