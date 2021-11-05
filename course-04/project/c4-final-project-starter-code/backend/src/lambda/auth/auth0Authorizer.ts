import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { Jwt } from '../../auth/Jwt'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJI22LYXbHMsSiMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1qa2s2Z2cxNS51cy5hdXRoMC5jb20wHhcNMjExMDIwMjMxNjA3WhcN
MzUwNjI5MjMxNjA3WjAkMSIwIAYDVQQDExlkZXYtamtrNmdnMTUudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsKJ+FtkcFQP0JThA
/BmRUM7GMzy6NS0qTwvxvX2xR1Djv003thttSsl54HxYSDLmGht3+JXohvAddHyo
+pmBy+VAFACNAR3UnSAuxYbnOE6VG5htNgcZjRo/eyPhwpQ11vSLcV9ds1CnBx5R
9UJ5VdArlPfBLqQ6Ro4EYl4SSYjks7rv7GrcEHMxK0WV4CBVCM//I9+ozSEY5hYZ
SRBgXEuOR4QO3JxRrGxrs9k6AS4CAlNAd7EP7pOpuFCTUatfYkwlvxmWv+G7EhLk
9uazosWiZDmm5aii8dMNkE0PeSk/EL+Eitu3M6Pou8o4RxTR2i/Z6Fa5U57cxeAT
cWmbwwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQWW2KF9h4N
JnATsfLZ1PdkLj+VWDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AAVklMapxGBSee2ittnrZ7/mH70kDNvbLr+Zi0nAqDxuri1dofU2HIeSrGwg5LSC
IFn+CB1Dutv4/6GoB6c22lbMXUSDwp1+qlQSHxgKzH290fMhWBR4Cl0/KoqkXS9i
lwtu8SWzB9V1/cEKZvaeDCqmPvQfYLB0Jbv7wzuQEMBAAWISZ3XDh0jVbp+g+ime
s8QDUdgX3wd/gewVhh5GVAA8Yagq9Nt7wZdJcT8xQ6tGf5SJq0i3k095ylMJmJt1
DC35rcDev4Qwa4Ks003VdVcRtrBQq9swka/aP4dh3wtcz+AP5fqpGFVwIw17oXHX
XymAZZWH4u73qHpe9sF8BIM=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.payload.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): Jwt {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as Jwt
}