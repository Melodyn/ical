import { promises as fs } from 'fs';
import axios from 'axios';
import ical from 'node-ical';

const processEventDate = ([key, value]) => ((value instanceof Date)
  ? [key, value.toISOString()]
  : [key, value]);

export const fromICS = (rawData) => ical.async.parseICS(rawData)
  .then((parsedData) => Object.values(parsedData))
  .then((events) => events.map((event) => Object.entries(event)))
  .then((events) => events.map((event) => event.map((processEventDate))))
  .then((events) => events.map((event) => Object.fromEntries(event)));

export const fromFile = (filepath) => fs.readFile(filepath, 'utf-8')
  .then((rawData) => fromICS(rawData));

export const fromURL = (url, params) => axios.get(url, params)
  .then(({ data }) => fromICS(data));
