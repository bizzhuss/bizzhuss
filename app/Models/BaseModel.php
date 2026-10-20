<?php

namespace App\Models;

use MongoDB\BSON\Decimal128;
use MongoDB\Laravel\Eloquent\Model as MongoModel;

abstract class BaseModel extends MongoModel
{
    /**
     * The database connection name for the model.
     *
     * @var string
     */
    protected $connection = 'mongodb';

    /**
     * Decode the given float value from an attribute.
     *
     * @param  mixed  $value
     * @return mixed
     */
    public function fromFloat($value)
    {
        if ($value instanceof Decimal128) {
            return (float) (string) $value;
        }

        return parent::fromFloat($value);
    }

    /**
     * Format the given decimal number.
     *
     * @param  mixed  $value
     * @param  int  $decimals
     * @return string|null
     */
    protected function asDecimal($value, $decimals)
    {
        if (is_null($value)) {
            return null;
        }

        if ($value instanceof Decimal128) {
            $value = (string) $value;
        }

        return parent::asDecimal($value, $decimals);
    }

    /**
     * Cast an attribute to a native PHP type with MongoDB BSON safety.
     *
     * @param  string  $key
     * @param  mixed  $value
     * @return mixed
     */
    protected function castAttribute($key, $value)
    {
        if ($value instanceof Decimal128) {
            $castType = $this->getCasts()[$key] ?? null;
            if (in_array($castType, ['int', 'integer'])) {
                return (int) (string) $value;
            }
            if (in_array($castType, ['real', 'float', 'double'])) {
                return (float) (string) $value;
            }
            if ($castType && str_starts_with($castType, 'decimal')) {
                return $this->asDecimal($value, explode(':', $castType, 2)[1] ?? 2);
            }
            return (float) (string) $value;
        }

        return parent::castAttribute($key, $value);
    }
}
