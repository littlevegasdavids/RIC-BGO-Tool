# 🔨 The RIC BGO TOOL 🔨
An online web-app in which employees and clients of [RIC](http://ricgroup.net/) use as a central excel file repository that is uploaded and put through a Python script that optimises the excel values in an automated fashion.

## ❓ Problem ❓
RIC employees created a Python script which takes in an excel input file (using the location of the file on their computer) and uses the [Gurobi Solver](https://www.gurobi.com/) to optimise these values. 

These same RIC employees soon realised how tedious it was to manually change the location of the excel file and run the Python script on their computers every time. They needed some form of online web solution in order to have an application that does this for themselves as well as their clients who shared the Gurobi Solver within the Python script.

## ✅ Solution ✅
One of the employees at RIC approached me in order to solve this problem. Myself and Angelo (RIC employee) are long time school friends and studied together at the University of Pretoria, he knew I studied Computer Science so designing and creating a solution was right up my alley. 

## 📚 What I learnt 📚
This was my first freelance project outside of university. This project took me about 2 months to create and implement. 

I learnt how to build my first full-stack web app, with the creative freedom of the frontend and the modular approach to the backend, both aspects of coding that I love to implement.

I tried different programming languages to implement this web app like Python, Django and Ruby on Rails. However I loved the workflow of using JavaScript as well as the syntax of my favorite and most underrated JS framework Svelte.

It was also my first exposure into Linux VPS, setting up Nginx to run a reverse proxy to the port with which my web app was running on the VPS and finally how to create a https certificate using [Let's Encrypt](https://letsencrypt.org/).

While this project is not perfect, it is hard and honest work. My RIC clients are really happy with the result as it gets the job done. Every now and again I learn more about ExpressJS & SvelteJS and implement more efficient and safer methods.

I am still learning how to optimise the website by ensuring that the request, response and content delivery times are quick.

## 🔧 Technologies 🔧

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

## 📺 Demo 📺
https://youtu.be/Tj6P0CXBQiI
