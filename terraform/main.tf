module "vpc" {
  source       = "./modules/vpc"
  project_name = var.project_name
}

module "ec2" {
  source         = "./modules/ec2"
  project_name   = var.project_name
  instance_type  = var.instance_type
  subnet_id      = module.vpc.public_subnet_id
  vpc_id         = module.vpc.vpc_id
  key_name       = var.key_name
}
