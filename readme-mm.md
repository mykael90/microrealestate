## INSTRUÇÕES

`git clone ...`
  
`yarn`

### Mode desenvolvimento  
`yarn dev`

### Caso faça alterações no código  
`yarn build`

### Rodar local (produção):  
`docker compose -f docker-compose.microservices.prod.yml --profile local up`  
Eu alterei o docker-compose.microservices.prod.yml para refletir as alterações do arquivo local e não do dockerhub do projeto. Dessa forma, posso fazer as implementações necessárias.  

### Rodar Ip setup:  
`docker APP_DOMAIN=x.x.x.x compose -f docker-compose.microservices.prod.yml --profile local up`

### Rodar DOMAIN https setup:  
`docker APP_DOMAIN=app.example.com APP_PROTOCOL=https compose -f docker-compose.microservices.prod.yml --profile local up`