import express from 'express'
 import cors from 'cors'


import {PrismaClient} from '@prisma/client'

import { convertHourStringToMinutes } from './utils/convert-hour-string-to-minutes'
import { convertMinutesToHourString } from './utils/convert-minutes-string-to-hours'

const app = express()

app.use(express.json())
const prisma = new PrismaClient({
    log:['query']
})

app.use(cors())

// http methods / API RESTfull / HTTP Codes (2-> sucesso, 3-> redirecionamento, 4-> erros da api, 5->erros inesperados )

//GET, POST, PUT, PATCH, DELETE


/**
 * Query: localhost:3333/ads?page=2&sort=title    (persistir estado[filtros, ordenação, coisas não sensiveis])
 * Route: localhost:3333/ads/5          (identificador na propria url)
 * Body:                                     (geralmente pra envio de formulario, escondido na requisição [melhor pra coisas sensiveis])
 */

//async await

app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include:{
            _count:{
                select:{
                    ads:true,   
                }
            }
        }
    })
    return response.json(games)
});


app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const body: any = request.body;

    

    const ad = await prisma.ad.create({
        data:{
            gameId: gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hoursStart: convertHourStringToMinutes(body.hoursStart),
            hoursEnd: convertHourStringToMinutes(body.hoursEnd),
            useVoiceChannel: body.useVoiceChannel,
           
        }
    })

    return response.status(201).json([body])
});

app.get('/games/:id/ads', async function  acesso(request, response){
   const gameId= request.params.id;
   const ads = await prisma.ad.findMany({
    select:{
    id:true,
    name:true,
    weekDays:true,
    useVoiceChannel:true,
    yearsPlaying:true,
    hoursStart:true,
    hoursEnd:true,
},
    where:{
        gameId: gameId,
    },
    orderBy:{
        creadetAt: 'desc'
    },
   })
    
    return response.json([ads.map(ad =>{
        return{
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesToHourString(ad.hoursStart),
            hourEnd: convertMinutesToHourString(ad.hoursEnd)
        }
    })])
})

app.get('/ads/:id/discord', async function acesso(request, response){
     const adId= request.params.id;
     
     const ad = await prisma.ad.findUniqueOrThrow({
        select:{
            discord:true,
        },
        where:{
            id:adId,
        },
     })
     
     return response.json({
        discord: ad.discord
     })
 })

app.listen(3333)