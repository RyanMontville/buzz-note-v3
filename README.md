# BuzzNote V3
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![JSON](https://img.shields.io/badge/json-5E5C5C?style=for-the-badge&logo=json&logoColor=white)
![HTML](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=white)

Version 3.0 of Buzznote - A bee hive health tracker. A web app for Monte's Own that can be used to track the health of bee hives. The app allows the user to quickly and easily record the data using their phone when the go to inspect the bee hives. The purpose of recording the inspections is to try to find patterns and possibly use the data from last year to predict what will happen this year. 

[View Live Demo](https://ryanmontville.com/buzz-note-v3/)
## New for version 3
* The app now runs on vanilla TypeScript with Vite instead of Angular
* The live app uses Firebase for user authentication. (The demo does not)
* This demo uses indexedDB to store all data. The live app uses FatFree (a php api) to communicate with the MySQL database.
* Viewing previous inspections now have buttons to view the next a previous inspections
* When conducting an inspaection, the user can now go back and change a previous frame
* When conducting an inspection, the app does not submit any data until the inspection is over
* Added a legend to the box visual to help the user understand what the different colors represent

## Previous Versions
* [View 2.0](https://github.com/RyanMontville/buzz-note-v2) - Angular app
* [view 1.0](https://github.com/RyanMontville/buzz-note-v1) - React app