import * as Joi from 'joi';

const validationSchema = Joi.object({
  PORT: Joi.number().port(),
  API_KEY: Joi.string(),
  CLAMAV_HOST: [Joi.string().ip(), Joi.string().hostname()],
  CLAMAV_PORT: Joi.number().port(),
  CLAMAV_TIMEOUT: Joi.number().positive().integer(),
  HEALTH_PING_URL: Joi.string().uri(),
  HEALTH_DISK_THRESHOLD_PERCENT: Joi.number().greater(0).less(1),
  HEALTH_DISK_THRESHOLD_PATH: Joi.string(),
  HEALTH_MEMORY_HEAP_THRESHOLD: Joi.number().positive().integer(),
  HEALTH_MEMORY_RSS_THRESHOLD: Joi.number().positive().integer(),
  MAX_FILE_COUNT: Joi.number().positive().integer(),
  MAX_FILE_SIZE: Joi.number().positive().integer(),
});

export default validationSchema;
