"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const convert_hour_string_to_minutes_1 = require("./utils/convert-hour-string-to-minutes");
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const prisma = new client_1.PrismaClient({
    log: ['query']
});
// http methods / API RESTfull / HTTP Codes (2-> sucesso, 3-> redirecionamento, 4-> erros da api, 5->erros inesperados )
//GET, POST, PUT, PATCH, DELETE
/**
 * Query: localhost:3333/ads?page=2&sort=title    (persistir estado[filtros, ordenação, coisas não sensiveis])
 * Route: localhost:3333/ads/5          (identificador na propria url)
 * Body:                                     (geralmente pra envio de formulario, escondido na requisição [melhor pra coisas sensiveis])
 */
//async await
app.get('/games', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const games = yield prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                }
            }
        }
    });
    return response.json(games);
}));
app.post('/games/:id/ads', (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = request.params.id;
    const body = request.body;
    const ad = yield prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hoursStart: (0, convert_hour_string_to_minutes_1.convertHourStringToMinutes)(body.hoursStart),
            hoursEnd: (0, convert_hour_string_to_minutes_1.convertHourStringToMinutes)(body.hoursEnd),
            useVoiceChannel: body.useVoiceChannel,
        }
    });
    return response.status(201).json(ad);
}));
app.get('/games/:id/ads', function acesso(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const gameId = request.params.id;
        const ads = yield prisma.ad.findMany({
            select: {
                id: true,
                name: true,
                weekDays: true,
                useVoiceChannel: true,
                yearsPlaying: true,
                hoursStart: true,
                hoursEnd: true,
            },
            where: {
                gameId: gameId,
            },
            orderBy: {
                creadetAt: 'desc'
            },
        });
        return response.json([ads.map(ad => {
                return Object.assign(Object.assign({}, ad), { weekDays: ad.weekDays.split(',') });
            })]);
    });
});
app.get('/ads/:id/discord', function acesso(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const adId = request.params.id;
        const ad = yield prisma.ad.findUniqueOrThrow({
            select: {
                discord: true,
            },
            where: {
                id: adId,
            },
        });
        return response.json({
            discord: ad.discord
        });
    });
});
app.listen(3333);
