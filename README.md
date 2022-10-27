# 🔧 The RIC BGO TOOL 🔧
An online web-app in which employees and clients of [RIC](http://ricgroup.net/) use as a central excel file repository that are uploaded and put through a Python script that optimises the excel values in an automation fashion.

#

## ❓ Problem ❓
RIC employees created a Python script which takes in a excel input file (using the location of the file on their computer) and uses the [Gurobi Solver](https://www.gurobi.com/) to optimise these values. 

These same RIC employees soon realised how tedious it was to manually change the location of the excel file and run the Python script on their computers everytime. They needed some form of online web solution in order to have an application that does this for themselves as well as their clients who shared the Gurobi Solver within the Python script.

#

## ✅ Solution ✅
One of the employees at RIC approached me in order to solve this problem. Myself and Angelo (RIC employee) are long time school friends and studied together at the University of Pretoria, he knew I studied Computer Science so designing and creating a solution was right up my alley. 

The BGO Tool consists of the following technologies: 

**Frontend**: Svelte and Tailwindcss 
<br/>
<img align="middle" alt="Svelte" width="30px" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg" />
<img align="middle" alt="Tailwindcss" width="30px" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg" />
<br/>
<br/>

**Backend**: ExpressJS and Postgresql 
<br/>
<img align="middle" alt="ExpressJs" width="30px" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" />
<img align="middle" alt="Postgresql" width="30px" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" />
<br/>
<br/>
The BGO Tool is hosted on a Linux Ubunutu server provided by [Host Africa](https://www.hostafrica.co.za/)
