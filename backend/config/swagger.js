const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Global Wings Charity API',
    version: '1.0.0',
    description: 'Student Management System API Documentation for Global Wings Charity - Providing free education since 2025',
    contact: {
      name: 'Global Wings Charity',
      email: 'contact@globalwingscharity.org'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Development server'
    },
    {
      url: 'https://api.globalwingscharity.org/api',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['username', 'email', 'password', 'firstName', 'lastName'],
        properties: {
          _id: {
            type: 'string',
            description: 'Auto-generated MongoDB ObjectId'
          },
          username: {
            type: 'string',
            description: 'Unique username',
            example: 'john_doe'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Unique email address',
            example: 'john.doe@example.com'
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'Password (min 8 characters, must contain uppercase, lowercase, and number)',
            example: 'Password123'
          },
          firstName: {
            type: 'string',
            description: 'User first name',
            example: 'John'
          },
          lastName: {
            type: 'string',
            description: 'User last name',
            example: 'Doe'
          },
          role: {
            type: 'string',
            enum: ['admin', 'teacher', 'student'],
            default: 'student',
            description: 'User role'
          },
          isActive: {
            type: 'boolean',
            default: true,
            description: 'Account status'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Student: {
        type: 'object',
        required: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone'],
        properties: {
          _id: {
            type: 'string',
            description: 'Auto-generated MongoDB ObjectId'
          },
          studentId: {
            type: 'string',
            description: 'Auto-generated student ID (format: GWC{YEAR}{0001})',
            example: 'GWC20250001'
          },
          firstName: {
            type: 'string',
            example: 'Jane'
          },
          lastName: {
            type: 'string',
            example: 'Smith'
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            example: '2005-05-15'
          },
          gender: {
            type: 'string',
            enum: ['Male', 'Female', 'Other']
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'jane.smith@example.com'
          },
          phone: {
            type: 'string',
            example: '+1234567890'
          },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              postalCode: { type: 'string' },
              country: { type: 'string', default: 'India' }
            }
          },
          parentContact: {
            type: 'object',
            properties: {
              fatherName: { type: 'string' },
              fatherPhone: { type: 'string' },
              motherName: { type: 'string' },
              motherPhone: { type: 'string' },
              guardianName: { type: 'string' },
              guardianPhone: { type: 'string' }
            }
          },
          batchId: {
            type: 'string',
            description: 'Reference to Batch'
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'graduated', 'dropped'],
            default: 'active'
          },
          admissionDate: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'string',
            example: 'Error message'
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' }
              }
            }
          },
          stack: {
            type: 'string',
            description: 'Stack trace (development only)'
          }
        }
      }
    },
    responses: {
      Unauthorized: {
        description: 'Unauthorized - Invalid or missing token',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              error: 'Not authorized to access this route'
            }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden - Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              error: 'User role is not authorized to access this route'
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              error: 'Validation failed',
              errors: [
                {
                  field: 'email',
                  message: 'Please provide a valid email address'
                }
              ]
            }
          }
        }
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              error: 'Resource not found'
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  // Path to the API routes
  apis: ['./routes/*.js', './controllers/*.js', './models/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
